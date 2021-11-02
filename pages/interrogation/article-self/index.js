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
    onDelArticle(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.dialog.confirm({
            message: '确认删除？'
        }).then(() => {
            wx.jyApp.http({
                url: '/article/delete',
                method: 'delete',
                data: {
                    id: id
                }
            }).then(() => {
                wx.jyApp.toast('删除成功');
                this.loadList(true);
            });
        })
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/article/self/list',
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
            data.page.list.map((item) => {
                switch (item.status) {
                    case 'APPROVING':
                        item._status = '审核中';
                        item._color = 'primary-color'
                        break;
                    case 'OPEN':
                        item._status = '已发布';
                        item._color = 'success-color';
                        break;
                    case 'REJECT':
                        item._status = '审核不通过';
                        item._color = 'danger-color';
                        break;
                    case 'HIDE':
                        item._status = '已下线';
                        item._color = 'danger-color';
                        break;
                }
            });
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