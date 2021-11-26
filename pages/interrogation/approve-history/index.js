Page({
    data: {
        stopRefresh: false,
        list: [],
        page: 1,
        limit: 20,
        totalPage: -1,
        status: '',
        searchVisible: false,
        statusList: ['', 1, 2, 3],
        statusMap: {
            1: '审核中',
            2: '审核通过',
            3: '审核不通过',
        }
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {

    },
    //显示搜索
    onShowSearch() {
        this.setData({
            searchVisible: !this.data.searchVisible,
        });
    },
    //选中地区
    onClickStatus(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            status: item,
            searchVisible: false
        });
        this.loadList(true);
    },
    onDetail(e) {
        var item = e.currentTarget.dataset.item;
        wx.setStorageSync('approv-detail', item);
        this.onGoto(e);
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    //加载列表
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctor/approve/history/all',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: this.data.limit,
                approveStatus: this.data.status,
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    list: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                });
            }
            data.page.list.map((item) => {
                item._approveStatus = this.data.statusMap[item.approveStatus];
                switch (item.approveStatus) {
                    case 1:
                        item.color = 'warn-color';
                        break;
                    case 2:
                        item.color = 'success-color';
                        break;
                    case 3:
                        item.color = 'danger-color';
                        break;
                }
            });
            this.setData({
                'page': this.data.page + 1,
                'totalPage': data.page.totalPage,
                'list': this.data.list.concat(data.page.list || [])
            });
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    }
})