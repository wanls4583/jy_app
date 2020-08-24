Page({
    data: {
        mallOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        interrogation: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        guidenceOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        active: 0
    },
    onLoad() {
        this.loadMallOrderList();
        this.loadInterrogationOrderList();
        this.loadGuidenceOrderList();
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onMallOrderRefresh() {
        this.loadMallOrderList(true).then(() => {
            this.setData({
                'mallOrder.stopRefresh': true
            });
        });
    },
    onMallOrderLoadMore() {
        this.loadMallOrderList();
    },
    onClickMallOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/order-detail/index?id=' + id
        });
    },
    onInterrogationOrderRefresh() {
        this.loadInterrogationOrderList(true).then(() => {
            this.setData({
                'interrogationOrder.stopRefresh': true
            });
        });
    },
    onInterrogationOrderLoadMore() {
        this.loadInterrogationOrderList();
    },
    onClickInterrogationOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/order-detail/index?id=' + id
        });
    },
    onGuidenceOrderRefresh() {
        this.loadGuidenceOrderList(true).then(() => {
            this.setData({
                'guidenceOrder.stopRefresh': true
            });
        });
    },
    onGuidenceOrderLoadMore() {
        this.loadGuidenceOrderList();
    },
    onClickGuidenceOrder(e) {
        var id = e.currentTarget.dataset.id;
    },
    loadMallOrderList(refresh) {
        if (this.data.mallOrder.loading || !refresh && this.data.mallOrder.totalPage > -1 && this.data.mallOrder.page > this.data.mallOrder.totalPage) {
            return;
        }
        this.data.mallOrder.loading = true;
        if (refresh) {
            this.setData({
                mallOrder: {
                    orderList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                }
            });
        }
        return wx.jyApp.http({
            url: '/order/list',
            page: this.data.mallOrder.page,
            limit: this.data.mallOrder.limit
        }).then((data) => {
            this.data.mallOrder.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
            });
            this.setData({
                'mallOrder.page': this.data.mallOrder.page + 1,
                'mallOrder.totalPage': data.page.totalPage,
                'mallOrder.orderList': this.data.mallOrder.orderList.concat(data.page.list)
            });
        })
    },
    loadInterrogationOrderList(refresh) {
        if (this.data.interrogation.loading || !refresh && this.data.interrogation.totalPage > -1 && this.data.interrogation.page > this.data.interrogation.totalPage) {
            return;
        }
        this.data.interrogation.loading = true;
        if (refresh) {
            this.setData({
                interrogation: {
                    orderList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                }
            });
        }
        return wx.jyApp.http({
            url: '/order/list',
            page: this.data.interrogation.page,
            limit: this.data.interrogation.limit
        }).then((data) => {
            this.data.interrogation.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
            });
            this.setData({
                'interrogation.page': this.data.interrogation.page + 1,
                'interrogation.totalPage': data.page.totalPage,
                'interrogation.orderList': this.data.interrogation.orderList.concat(data.page.list)
            });
        })
    },
    loadGuidenceOrderList(refresh) {
        if (this.data.guidenceOrder.loading || !refresh && this.data.guidenceOrder.totalPage > -1 && this.data.guidenceOrder.page > this.data.guidenceOrder.totalPage) {
            return;
        }
        this.data.guidenceOrder.loading = true;
        if (refresh) {
            this.setData({
                guidenceOrder: {
                    orderList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                }
            });
        }
        return wx.jyApp.http({
            url: '/order/list',
            page: this.data.guidenceOrder.page,
            limit: this.data.guidenceOrder.limit
        }).then((data) => {
            this.data.guidenceOrder.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
            });
            this.setData({
                'guidenceOrder.page': this.data.guidenceOrder.page + 1,
                'guidenceOrder.totalPage': data.page.totalPage,
                'guidenceOrder.orderList': this.data.guidenceOrder.orderList.concat(data.page.list)
            });
        })
    }
})