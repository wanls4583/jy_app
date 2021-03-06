Page({
    data: {
        messageList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        totalCount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['noticeCount', 'msgCount'],
            actions: ['updateNoticeCount', 'updateMsgCount'],
        });
        this.storeBindings.updateStoreBindings();
        //未读消息数量
        this.msgCount = -1;
        this.firstLoad = true;
        var today = new Date();
        this.today = today - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000;
    },
    onShow() {
        this.getMessageCount().then(() => {
            if (!this.checkMsgCount() && !this.firstLoad) {
                this.checkMsgLength();
            }
        }).finally(() => {
            this.firstLoad = false;
        });
    },
    onClickMsg(e) {
        var id = e.currentTarget.dataset.id;
        var roomId = e.currentTarget.dataset.roomid;
        if (!wx.jyApp.utils.checkDoctor({
                checkStatus: true
            })) {
            return;
        }
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/chat/index?roomId=' + roomId
        });
        for (var i = 0; i < this.data.messageList.length; i++) {
            var item = this.data.messageList[i];
            if (item.id == id) {
                if (item.notReadNum) {
                    var msgCount = wx.jyApp.store.msgCount;
                    if (msgCount > 0) {
                        this.updateMsgCount(wx.jyApp.store.msgCount - item.notReadNum);
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
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20
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
    //未读消息总数量
    getMessageCount() {
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead',
            hideTip: true
        }).then((data) => {
            data.msgTotalNotRead = data.msgTotalNotRead || 0;
            if (data.msgTotalNotRead) {
                wx.setTabBarBadge({
                    index: 2,
                    text: String(data.msgTotalNotRead),
                    fail() {}
                });
            } else {
                wx.removeTabBarBadge({
                    index: 2,
                    fail() {}
                });
            }
            if (data.msgTotalNotRead != this.msgCount) {
                this.loadList(true);
            }
            this.updateNoticeCount(data.totalNotRead || 0);
            this.updateMsgCount(data.msgTotalNotRead || 0);
            this.msgCount = (data.msgTotalNotRead || 0);
        });
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
    //检查列表是否有新增
    checkMsgLength() {
        return wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: 1,
                limit: 1
            }
        }).then((data) => {
            if (data.page.totalCount != this.data.totalCount) {
                this.loadList(true);
            }
        })
    }
})