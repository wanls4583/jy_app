Page({
    data: {
        messageList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            actions: ['updateNoticeCount']
        });
        this.storeBindings.updateStoreBindings();
        this.loadList();
        this.readAll();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onClickMsg(e) {
        var index = e.currentTarget.dataset.index;
        var item = this.data.messageList[index];
        if (item.linkUrl) {
            wx.navigateTo({
                url: '/pages/web-view/index?url=' + item.linkUrl
            });
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
            url: '/systemnotice/list',
            data: {
                page: this.data.page,
                limit: 20
            }
        })
        this.request.then((data) => {
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                messageList: this.data.messageList.concat(data.page.list)
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.request = null;
            this.loading = false;
        });
    },
    //设置已读
    readAll() {
        wx.jyApp.http({
            url: '/systemnotice/read/all',
            method: 'post'
        }).then(() => {
            this.updateNoticeCount(0);
        });
    }
})