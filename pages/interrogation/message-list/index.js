Page({
    data: {
        messageList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        totalCount: 0
    },
    onLoad(option) {
        this.loadList(true).then(() => {
            this.checkList();
        });
    },
    onShow() {
        if (this.data.totalPage > -1) {
            this.checkList();
        }
        this.getMessageCount();
    },
    onClickMsg(e) {
        var id = e.currentTarget.dataset.id;
        var roomId = e.currentTarget.dataset.roomid;
        if (!wx.jyApp.utils.checkDoctor({ checkStatus: true })) {
            return;
        }
        wx.navigateTo({
            url: '/pages/interrogation/chat/index?roomId=' + roomId
        });
        for (var i = 0; i < this.data.messageList.length; i++) {
            var item = this.data.messageList[i];
            if (item.id == id) {
                item.notReadNum = 0;
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
            this.setData({
                page: 1,
                totalPage: -1,
                messageList: []
            });
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: this.data.page,
                limit: 20
            }
        });
        this.request.then((data) => {
            var today = new Date();
            today = today - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000;
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.updateTime = item.updateTime * 1000;
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
    //检查是否有新消息
    checkList() {
        wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: 1,
                limit: 1
            },
            hideTip: true
        }).then((data) => {
            if (data.page.totalCount != this.data.totalCount) {
                this.loadList(true);
            }
        }).finally(() => {
            setTimeout(() => {
                var pages = getCurrentPages();
                if (pages.length == 1 && pages[0].route == 'pages/interrogation/message-list/index') {
                    this.checkList();
                }
            }, 5000);
        });
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
        });
    }
})