Page({
    data: {
        dataList: [],
        stopRefresh: false,
        totalCount: -1,
        statusMap: {
            1: '提现中',
            2: '已到账',
            3: '提现失败',
        }
    },
    onLoad() {
        this.loadList();
    },
    onRefresh() {
        this.loadList(true);
    },
    loadList(refresh) {
        if (refresh) {
            this.setData({
                totalCount: -1,
                dataList: []
            });
            this.request && this.request.requestTask.abort();
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctorwithdraw/list'
        });
        this.request.then((data) => {
            data.list.map((item) => {
                item._status = this.data.statusMap[item.status];
            });
            this.setData({
                dataList: data.list,
                totalCount: data.list.length
            })
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.loading = false;
            this.request = null;
        });
    }
})