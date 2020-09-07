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
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
        this.loadMallOrderList();
        this.loadInterrogationOrderList();
        this.loadApplyOrderList();
        this.loadGuidanceOrderList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onMallOrderRefresh() {
        this.loadMallOrderList(true);
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
        this.loadInterrogationOrderList(true);
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
        this.loadApplyOrderList(true);
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
        this.loadGuidanceOrderList(true);
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
            this.mallRequest && this.mallRequest.requestTask.abort();
        } else if (this.data.mallOrder.loading || this.data.mallOrder.totalPage > -1 && this.data.mallOrder.page > this.data.mallOrder.totalPage) {
            return;
        }
        this.data.mallOrder.loading = true;
        this.mallRequest = wx.jyApp.http({
            url: '/order/list',
            data: {
                page: this.data.mallOrder.page,
                limit: this.data.mallOrder.limit
            }
        });
        this.mallRequest.then((data) => {
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                item.goods.map((_item) => {
                    _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                    _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
                });
                switch (item.status) {
                    case 0:
                    case 5:
                    case 6: item.statusColor = 'danger-color'; break;
                    case 1:
                    case 7:
                    case 8: item.statusColor = 'success-color'; break;
                }
            });
            this.setData({
                'mallOrder.page': this.data.mallOrder.page + 1,
                'mallOrder.totalPage': data.page.totalPage,
                'mallOrder.orderList': this.data.mallOrder.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.mallRequest = null;
            this.data.mallOrder.loading = false;
            this.setData({
                'mallOrder.stopRefresh': true
            });
        });
        return this.mallRequest;
    },
    loadInterrogationOrderList(refresh) {
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
            this.interrogationRequest && this.interrogationRequest.requestTask.abort();
        } else if (this.data.interrogationOrder.loading || this.data.interrogationOrder.totalPage > -1 && this.data.interrogationOrder.page > this.data.interrogationOrder.totalPage) {
            return;
        }
        this.data.interrogationOrder.loading = true;
        this.interrogationRequest = wx.jyApp.http({
            url: '/consultorder/list',
            data: {
                page: this.data.interrogationOrder.page,
                limit: this.data.interrogationOrder.limit
            }
        });
        this.interrogationRequest.then((data) => {
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                switch (item.status) {
                    case 0:
                    case 6:
                    case 7: item.statusColor = 'danger-color'; break;
                    case 1:
                    case 3: item.statusColor = 'success-color'; break;
                }
            });
            this.setData({
                'interrogationOrder.page': this.data.interrogationOrder.page + 1,
                'interrogationOrder.totalPage': data.page.totalPage,
                'interrogationOrder.orderList': this.data.interrogationOrder.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.interrogationRequest = null;
            this.data.interrogationOrder.loading = false;
            this.setData({
                'interrogationOrder.stopRefresh': true
            });
        });
        return this.interrogationRequest;
    },
    loadGuidanceOrderList(refresh) {
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
            this.guidanceRequest && this.guidanceRequest.requestTask.abort();
        } else if (this.data.guidanceOrder.loading || this.data.guidanceOrder.totalPage > -1 && this.data.guidanceOrder.page > this.data.guidanceOrder.totalPage) {
            return;
        }
        this.data.guidanceOrder.loading = true;
        this.guidanceRequest = wx.jyApp.http({
            url: '/nutritionorder/list',
            data: {
                page: this.data.guidanceOrder.page,
                limit: this.data.guidanceOrder.limit
            }
        });
        this.guidanceRequest.then((data) => {
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                item._sex = item.sex == 1 ? '男' : '女';
                item.age = new Date().getFullYear() - Date.prototype.parseDate(item.birthday).getFullYear();
                switch (item.status) {
                    case 0:
                    case 5:
                    case 6: item.statusColor = 'danger-color'; break;
                    case 1:
                    case 7:
                    case 8: item.statusColor = 'success-color'; break;
                }
            });
            this.setData({
                'guidanceOrder.page': this.data.guidanceOrder.page + 1,
                'guidanceOrder.totalPage': data.page.totalPage,
                'guidanceOrder.orderList': this.data.guidanceOrder.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.guidanceRequest = null;
            this.data.guidanceOrder.loading = false;
            this.setData({
                'guidanceOrder.stopRefresh': true
            });
        });
        return this.guidanceRequest;
    },
    loadApplyOrderList(refresh) {
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
            this.applyRequest && this.applyRequest.requestTask.abort();
        } else if (this.data.applyOrder.loading || this.data.applyOrder.totalPage > -1 && this.data.applyOrder.page > this.data.applyOrder.totalPage) {
            return;
        }
        this.data.applyOrder.loading = true;
        this.applyRequest = wx.jyApp.http({
            url: '/apply/list',
            data: {
                page: this.data.applyOrder.page,
                limit: this.data.applyOrder.limit
            }
        });
        this.applyRequest.then((data) => {
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.applyOrderStatusMap[item.status];
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                switch (item.status) {
                    case 0:
                    case 1:
                    case 4:
                    case 5: item.statusColor = 'danger-color'; break;
                    case 2: item.statusColor = 'success-color'; break;
                }
            });
            this.setData({
                'applyOrder.page': this.data.applyOrder.page + 1,
                'applyOrder.totalPage': data.page.totalPage,
                'applyOrder.orderList': this.data.applyOrder.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.applyRequest = null;
            this.data.applyOrder.loading = false;
            this.setData({
                'applyOrder.stopRefresh': true
            });
        });
        return this.applyRequest;
    }
})