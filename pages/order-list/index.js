Page({
    data: {
        mallOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        interrogationOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        applyOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        guidanceOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
        },
        active: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['authUserInfo']
        });
        this.loadMallOrderList();
        this.loadInterrogationOrderList();
        this.loadApplyOrderList();
        // this.loadGuidanceOrderList();
        this.setData({
            guidanceOrder: {
                orderList: [{
                    money: 100,
                    orderNum: '125432113',
                    status: '未支付',
                    money: '500',
                    doctorName: '李医生',
                    deliveryAmount: 10,
                    totalAmount: 100,
                    patient: {
                        name: '张三',
                        sex: '男',
                        age: 31,
                        height: '170',
                        weight: 100
                    },
                    goods: [{
                        goodsName: '名称',
                        url: 'https://p0.ssl.img.360kuai.com/t01e9b0ee675fb9a2f4.webp',
                        count: 1,
                        price: 100
                    }]
                }],
                page: 2,
                totalPage: 1
            }
        });
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
            url: '/pages/interrogation/apply-order-detail/index?type=interrogation&id=' + id
        });
    },
    onApplyOrderRefresh() {
        this.loadApplyOrderList(true).then(() => {
            this.setData({
                'applyOrder.stopRefresh': true
            });
        });
    },
    onApplyOrderLoadMore() {
        this.loadApplyOrderList();
    },
    onClickApplyOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/apply-order-detail/index?id=' + id
        });
    },
    onGuidanceOrderRefresh() {
        this.loadGuidanceOrderList(true).then(() => {
            this.setData({
                'guidanceOrder.stopRefresh': true
            });
        });
    },
    onGuidanceOrderLoadMore() {
        this.loadGuidanceOrderList();
    },
    onClickGuidanceOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/guidance-order-detail/index?id=' + id
        });
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
        if (this.data.interrogationOrder.loading || !refresh && this.data.interrogationOrder.totalPage > -1 && this.data.interrogationOrder.page > this.data.interrogationOrder.totalPage) {
            return;
        }
        this.data.interrogationOrder.loading = true;
        if (refresh) {
            this.setData({
                interrogationOrder: {
                    orderList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                }
            });
        }
        return wx.jyApp.http({
            url: '/consultorder/list',
            page: this.data.interrogationOrder.page,
            limit: this.data.interrogationOrder.limit
        }).then((data) => {
            this.data.interrogationOrder.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
            });
            this.setData({
                'interrogationOrder.page': this.data.interrogationOrder.page + 1,
                'interrogationOrder.totalPage': data.page.totalPage,
                'interrogationOrder.orderList': this.data.interrogationOrder.orderList.concat(data.page.list)
            });
        })
    },
    loadGuidanceOrderList(refresh) {
        if (this.data.guidanceOrder.loading || !refresh && this.data.guidanceOrder.totalPage > -1 && this.data.guidanceOrder.page > this.data.guidanceOrder.totalPage) {
            return;
        }
        this.data.guidanceOrder.loading = true;
        if (refresh) {
            this.setData({
                guidanceOrder: {
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
            page: this.data.guidanceOrder.page,
            limit: this.data.guidanceOrder.limit
        }).then((data) => {
            this.data.guidanceOrder.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
            });
            this.setData({
                'guidanceOrder.page': this.data.guidanceOrder.page + 1,
                'guidanceOrder.totalPage': data.page.totalPage,
                'guidanceOrder.orderList': this.data.guidanceOrder.orderList.concat(data.page.list)
            });
        })
    },
    loadApplyOrderList(refresh) {
        if (this.data.applyOrder.loading || !refresh && this.data.applyOrder.totalPage > -1 && this.data.applyOrder.page > this.data.applyOrder.totalPage) {
            return;
        }
        this.data.applyOrder.loading = true;
        if (refresh) {
            this.setData({
                applyOrder: {
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
            page: this.data.applyOrder.page,
            limit: this.data.applyOrder.limit
        }).then((data) => {
            this.data.applyOrder.loading = false;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.orderStatusMap[item.status];
            });
            this.setData({
                'applyOrder.page': this.data.applyOrder.page + 1,
                'applyOrder.totalPage': data.page.totalPage,
                'applyOrder.orderList': this.data.applyOrder.orderList.concat(data.page.list)
            });
        })
    }
})