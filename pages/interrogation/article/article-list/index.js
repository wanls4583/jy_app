Page({
    data: {
        list: [],
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
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
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
            url: '/article/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20
            }
        })
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    list: []
                });
            }
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                list: this.data.list.concat(data.page.list)
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.request = null;
            this.loading = false;
        });
    },
})