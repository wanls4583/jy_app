Page({
    data: {
        dataList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        statusMap: {
            1: '提现中',
            2: '已到账'
        }
    },
    onLoad() {
        this.loadList();
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
                dataList: []
            });
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctorwithdraw/list',
            data: {
                page: this.data.page,
                limit: 20
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item._status = this.data.statusMap[item.status];
            });
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                dataList: this.data.dataList.concat(data.page.list),
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.loading = false;
            this.request = null;
        });
    }
})