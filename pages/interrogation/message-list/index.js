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
    },
    onShow() {
        this.getMessageCount().then(() => {
            if (!this.checkMsgCount()) {
                this.checkMsgLength();
            }
        });
    },
    onClickMsg(e) {
        var id = e.currentTarget.dataset.id;
        var roomId = e.currentTarget.dataset.roomid;
        if (!wx.jyApp.utils.checkDoctor({ checkStatus: true })) {
            return;
        }
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/chat/index?roomId=' + roomId
        });
        for (var i = 0; i < this.data.messageList.length; i++) {
            var item = this.data.messageList[i];
            if (item.id == id) {
                if (item.notReadNum) {
                    item.notReadNum = 0;
                    var msgCount = wx.jyApp.store.msgCount;
                    if (msgCount > 0) {
                        this.updateMsgCount(wx.jyApp.store.msgCount - 1);
                    }
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
                    scrollTop: Math.random()
                });
            }
            var today = new Date();
            today = today - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000;
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                // item.updateTime = item.updateTime * 1000;
                if (item.updateTime > today) {
                    item.updateTime = new Date(item.updateTime).formatTime('hh:mm');
                } else {
                    item.updateTime = new Date(item.updateTime).formatTime('yyyy-MM-dd hh:mm');
                }
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
    //未读消息总数量
    getMessageCount() {
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead',
            hideTip: true
        }).then((data) => {
            if (data.msgTotalNotRead) {
                wx.setTabBarBadge({
                    index: 2,
                    text: String(data.msgTotalNotRead),
                    fail() { }
                });
            } else {
                wx.removeTabBarBadge({
                    index: 2,
                    fail() { }
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