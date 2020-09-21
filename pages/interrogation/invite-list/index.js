Page({
    data: {
        dataList: [],
        stopRefresh: false,
        totalCount: -1,
        inviteWayMap: {
            1: '分享好友',
            2: '二维码'
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
            url: '/doctor/invite/list'
        });
        this.request.then((data) => {
            data.list.map((item) => {
                item.inviteWay = this.data.inviteWayMap[item.inviteWay];
                item.inviteDate = item.inviteDate && item.inviteDate.slice(0, 10) || '';
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