Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        messageList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        totalCount: 0,
        menuRect: wx.jyApp.utils.getMenuRect()
    },
    lifetimes: {
        attached(option) {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['noticeCount', 'msgCount', 'userInfo', 'doctorInfo'],
                actions: ['updateNoticeCount', 'updateMsgCount'],
            });
            this.storeBindings.updateStoreBindings();
            //未读消息数量
            this.msgCount = -1;
            this.firstLoad = true;
            var today = new Date();
            this.today = today - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000;
            if (this.data.userInfo.viewVersion == 2 || this.data.doctorInfo && this.data.doctorInfo.hosDepartment) {
                this.viewVersion = 2
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onShow() {
            this.loadList(true).then(() => {
                this.checkMsgCount();
            });
        },
        onClickMsg(e) {
            var item = e.currentTarget.dataset.item;
            var id = item.id;
            var roomId = item.roomId;
            var groupFlag = item.groupFlag;
            if (!wx.jyApp.utils.checkDoctor({
                    checkStatus: true
                })) {
                return;
            }
            wx.jyApp.utils.navigateTo({
                url: `/pages/interrogation/chat${this.viewVersion==2?'-v2':''}/index?roomId=${roomId}&groupFlag=${groupFlag}`
            });
            for (var i = 0; i < this.data.messageList.length; i++) {
                var item = this.data.messageList[i];
                if (item.id == id) {
                    if (item.notReadNum) {
                        var msgCount = wx.jyApp.store.msgCount;
                        if (msgCount > 0) {
                            this.updateMsgCount(msgCount - item.notReadNum);
                            this.msgCount = msgCount;
                        }
                        item.notReadNum = 0;
                    }
                    this.setData({
                        [`messageList[${i}]`]: item
                    });
                    break;
                }
            }
        },
        onRefresh() {
            this.loadList(true);
        },
        onLoadMore() {
            this.loadList();
        },
        loadList(refresh) {
            if (refresh) {
                this.request && this.request.requestTask.abort();
            } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
                return;
            }
            var url = '/chat/list';
            if (this.viewVersion == 2) {
                url = '/chat/v2/list'
            }
            this.loading = true;
            this.request = wx.jyApp.http({
                url: url,
                data: {
                    page: refresh ? 1 : this.data.page,
                    limit: 30
                }
            });
            this.request.then((data) => {
                if (refresh) {
                    this.data.page = 1;
                    this.data.totalPage = -1;
                    this.data.messageList = [];
                    this.setData({
                        scrollTop: true
                    });
                }
                data.page.list = data.page.list || [];
                data.page.list.map((item) => {
                    item.originTime = item.updateTime;
                    item.updateTime = this.getFormatTime(item.updateTime);
                });
                this.setData({
                    page: this.data.page + 1,
                    totalPage: data.page.totalPage,
                    totalCount: data.page.totalCount,
                    messageList: this.data.messageList.concat(data.page.list)
                });
            }).finally(() => {
                this.setData({
                    stopRefresh: true
                });
                this.loading = false;
                this.request = null;
            });
            return this.request;
        },
        getFormatTime(time) {
            if (time > this.today) {
                time = new Date(time).formatTime('hh:mm');
            } else {
                time = new Date(time).formatTime('yyyy-MM-dd hh:mm');
            }
            return time;
        },
        updateLastMessage(roomId, lastMessage, time) {
            this.data.messageList.map((item, i) => {
                if (item.roomId == roomId && time != item.originTime) {
                    item.lastMessage = lastMessage;
                    item.updateTime = this.getFormatTime(time);
                    item.originTime = time;
                    this.setData({
                        [`messageList[${i}]`]: item
                    })
                }
            });
        },
        //检查未读消息是否有变化
        checkMsgCount() {
            var loaded = false;
            if (this.msgCount != wx.jyApp.store.msgCount) {
                this.loadList(true);
                this.msgCount = wx.jyApp.store.msgCount;
                loaded = true;
            }
            clearTimeout(this.checkTimer);
            this.checkTimer = setTimeout(() => {
                this.checkMsgCount();
            }, 1000);
            return loaded;
        },
    }
})