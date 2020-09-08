Page({
    data: {
        dataList: [],
        stopRefresh: false,
        totalCount: -1,
        inviteWayMap: {

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
        }).then((data) => {
            data.list.map((item) => {
                item.inviteWay = this.data.inviteWayMap[item.inviteWay];
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