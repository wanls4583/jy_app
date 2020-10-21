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
        wx.test = this;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'configData'],
            actions: ['addCart', 'updateCartNum', 'clearCart']
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
    onShow() {
        if (wx.jyApp.hasAppraiseId) { //已经评价
            this.data.interrogationOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasAppraiseId) {
                    item.isAppraise = true;
                    this.setStatusColor(item, 'interrogation');
                    this.setData({
                        [`interrogationOrder.orderList[${index}]`]: item
                    });
                }
            });
            delete wx.jyApp.hasAppraiseId;
        }
        if (wx.jyApp.hasRecievedId) { //已经接诊
            this.data.interrogationOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasRecievedId) {
                    item.status = 5;
                    item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                    this.setStatusColor(item, 'interrogation');
                    this.setData({
                        [`interrogationOrder.orderList[${index}]`]: item
                    });
                }
            });
            delete wx.jyApp.hasRecievedId;
        }
        if (wx.jyApp.hasPayGuidanceId) { //已支付
            this.data.guidanceOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasPayGuidanceId) {
                    item.status = 1;
                    item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                    this.setStatusColor(item, 'mall');
                    this.setData({
                        [`guidanceOrder.orderList[${index}]`]: item
                    });
                }
            });
            delete wx.jyApp.hasPayGuidanceId;
        }
        if (wx.jyApp.hasTicketId) { //已申请发票
            this.data.interrogationOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasTicketId) {
                    item.ticketStatus = 1;
                    this.setData({
                        [`interrogationOrder.orderList[${index}]`]: item
                    });
                }
            });
            this.data.applyOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasTicketId) {
                    item.ticketStatus = 1;
                    this.setData({
                        [`applyOrder.orderList[${index}]`]: item
                    });
                }
            });
            this.data.guidanceOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasTicketId) {
                    item.ticketStatus = 1;
                    this.setData({
                        [`guidanceOrder.orderList[${index}]`]: item
                    });
                }
            });
            this.data.mallOrder.orderList.map((item, index) => {
                if (item.id == wx.jyApp.hasTicketId) {
                    item.ticketStatus = 1;
                    this.setData({
                        [`mallOrder.orderList[${index}]`]: item
                    });
                }
            });
            delete wx.jyApp.hasTicketId;
        }
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //立即接诊
    onRecieve(e) {
        wx.jyApp.toRecieve = true;
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
    onInterrogationOrderRefresh() {
        this.loadInterrogationOrderList(true);
    },
    onInterrogationOrderLoadMore() {
        this.loadInterrogationOrderList();
    },
    onApplyOrderRefresh() {
        this.loadApplyOrderList(true);
    },
    onApplyOrderLoadMore() {
        this.loadApplyOrderList();
    },
    onGuidanceOrderRefresh() {
        this.loadGuidanceOrderList(true);
    },
    onGuidanceOrderLoadMore() {
        this.loadGuidanceOrderList();
    },
    //支付问诊单
    onInterrogationPay(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/consultorder/pay',
            method: 'post',
            data: {
                id: id
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                this.loadInterrogationOrderList(true);
                wx.navigateTo({
                    url: '/pages/interrogation/chat/index?id=' + id
                });
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    //支付商城订单
    onMallOrderPay(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/wx/pay/submit',
            method: 'post',
            data: {
                id: id
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                this.loadMallOrderList(true);
                wx.navigateTo({
                    url: '/pages/mall/order-detail/index?id=' + id
                });
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    onBuyAgain(e) {
        var order = e.currentTarget.dataset.order;
        var ids = [];
        var countMap = {};
        order.goods.map((item) => {
            var id = item.goodsId || item.id;
            if (ids.indexOf(id) == -1) {
                ids.push(id);
                countMap[id] = item.count;
            }
        });
        wx.showLoading('加载中...', true);
        wx.jyApp.http({
            url: '/goods/infos',
            data: {
                ids: ids.join(',')
            }
        }).then((data) => {
            data.infos.map((item) => {
                this.addCart(item);
                this.updateCartNum(item.id, countMap[item.id]);
            });
            if (data.infos.length < ids.length) {
                setTimeout(() => {
                    if (!data.infos.length) {
                        wx.jyApp.toast('商品已经下线');
                    } else {
                        wx.jyApp.toast('部分商品已下线，请确认后再提交订单');
                    }
                }, 0);
            }
            if (data.infos.length) {
                wx.navigateTo({
                    url: '/pages/mall/cart/index'
                });
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
    //删除问诊订单
    onDelInterrogation(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/consultorder/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.interrogationOrder.orderList = this.data.interrogationOrder.orderList.filter((item) => {
                            return item.id != id;
                        });
                        if (!this.data.interrogationOrder.orderList) {
                            this.data.interrogationOrder.totalPage = 0;
                        }
                        this.setData({
                            interrogationOrder: this.data.interrogationOrder
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //删除申请订单
    onDelApplyOrder(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/apply/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.applyOrder.orderList = this.data.applyOrder.orderList.filter((item) => {
                            return item.id != id;
                        });
                        if (!this.data.applyOrder.orderList) {
                            this.data.applyOrder.totalPage = 0;
                        }
                        this.setData({
                            applyOrder: this.data.applyOrder
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //删除指导订单
    onDelGuidanceOrder(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/nutritionorder/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.guidanceOrder.orderList = this.data.guidanceOrder.orderList.filter((item) => {
                            return item.id != id;
                        });
                        if (!this.data.guidanceOrder.orderList) {
                            this.data.guidanceOrder.totalPage = 0;
                        }
                        this.setData({
                            guidanceOrder: this.data.guidanceOrder
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //删除商城订单
    onDelMallOrder(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/order/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.mallOrder.orderList = this.data.mallOrder.orderList.filter((item) => {
                            return item.id != id;
                        });
                        if (!this.data.mallOrder.orderList) {
                            this.data.mallOrder.totalPage = 0;
                        }
                        this.setData({
                            mallOrder: this.data.mallOrder
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //指导订单退费
    onGuidanceOrderReturn(e) {
        wx.showModal({
            content: '确认对此订单进行退费？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('退费中...', true);
                    wx.jyApp.http({
                        url: '/nutritionorder/refund',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.guidanceOrder.orderList.map((item, index) => {
                            if (item.id == id) {
                                item.status = 5;
                                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                                this.setStatusColor(item, 'mall');
                                this.setData({
                                    [`guidanceOrder.orderList${index}`]: item
                                });
                            }
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //商城订单退费
    onMallOrderReturn(e) {
        wx.showModal({
            content: '确认对此订单进行退费？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('退费中...', true);
                    wx.jyApp.http({
                        url: '/order/refund',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        this.data.mallOrder.orderList.map((item, index) => {
                            if (item.id == id) {
                                item.status = 5;
                                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                                this.setStatusColor(item, 'mall');
                                this.setData({
                                    [`mallOrder.orderList[${index}]`]: item
                                });
                            }
                        });
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    loadMallOrderList(refresh) {
        if (refresh) {
            this.mallRequest && this.mallRequest.requestTask.abort();
        } else if (this.data.mallOrder.loading || this.data.mallOrder.totalPage > -1 && this.data.mallOrder.page > this.data.mallOrder.totalPage) {
            return;
        }
        this.data.mallOrder.loading = true;
        this.mallRequest = wx.jyApp.http({
            url: '/order/list',
            data: {
                page: refresh ? 1 : this.data.mallOrder.page,
                limit: this.data.mallOrder.limit
            }
        });
        this.mallRequest.then((data) => {
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
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item.ticketMoney = Number((item.totalAmount - item.deliveryCost).toFixed(2));
                item.ticketDays = Math.ceil((todayBegin - item.orderTime) / aDay);
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                item.applyTicketVisible = item.ticketDays <= this.data.configData.allowApplyTicketDays && item.totalAmount > 0 && item.status == 8 || false;
                item.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(item.status) > -1;
                item.delVisible = [0, 4, 6, 8].indexOf(item.status) > -1;
                item.goods.map((_item) => {
                    _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                    _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
                });
                this.setStatusColor(item, 'mall');
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
            this.interrogationRequest && this.interrogationRequest.requestTask.abort();
        } else if (this.data.interrogationOrder.loading || this.data.interrogationOrder.totalPage > -1 && this.data.interrogationOrder.page > this.data.interrogationOrder.totalPage) {
            return;
        }
        this.data.interrogationOrder.loading = true;
        this.interrogationRequest = wx.jyApp.http({
            url: '/consultorder/list',
            data: {
                page: refresh ? 1 : this.data.interrogationOrder.page,
                limit: this.data.interrogationOrder.limit
            }
        });
        this.interrogationRequest.then((data) => {
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
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item.ticketDays = Math.ceil((todayBegin - item.orderTime) / aDay);
                item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                item.applyTicketVisible = item.ticketDays <= this.data.configData.allowApplyTicketDays && item.orderAmount > 0 && item.status == 3 || false;
                item.oneMoreVisible = [3, 4, 7].indexOf(item.status) > -1;
                item.delVisible = [0, 3, 4, 7].indexOf(item.status) > -1;
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                this.setStatusColor(item, 'interrogation')
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
            this.guidanceRequest && this.guidanceRequest.requestTask.abort();
        } else if (this.data.guidanceOrder.loading || this.data.guidanceOrder.totalPage > -1 && this.data.guidanceOrder.page > this.data.guidanceOrder.totalPage) {
            return;
        }
        this.data.guidanceOrder.loading = true;
        this.guidanceRequest = wx.jyApp.http({
            url: '/nutritionorder/list',
            data: {
                page: refresh ? 1 : this.data.guidanceOrder.page,
                limit: this.data.guidanceOrder.limit
            }
        });
        this.guidanceRequest.then((data) => {
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
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item.ticketMoney = Number((item.totalAmount - item.deliveryCost).toFixed(2));
                item.ticketDays = Math.ceil((todayBegin - item.orderTime) / aDay);
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                item.applyTicketVisible = item.ticketDays <= this.data.configData.allowApplyTicketDays && item.totalAmount > 0 && item.status == 8 || false;
                item.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(item.status) > -1;
                item.delVisible = [0, 4, 6, 8].indexOf(item.status) > -1;
                item._sex = item.sex == 1 ? '男' : '女';
                item.age = new Date().getFullYear() - Date.prototype.parseDate(item.birthday).getFullYear();
                item.goods.map((_item) => {
                    _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                    _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
                });
                this.setStatusColor(item, 'mall');
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
            this.applyRequest && this.applyRequest.requestTask.abort();
        } else if (this.data.applyOrder.loading || this.data.applyOrder.totalPage > -1 && this.data.applyOrder.page > this.data.applyOrder.totalPage) {
            return;
        }
        this.data.applyOrder.loading = true;
        this.applyRequest = wx.jyApp.http({
            url: '/apply/list',
            data: {
                page: refresh ? 1 : this.data.applyOrder.page,
                limit: this.data.applyOrder.limit
            }
        });
        this.applyRequest.then((data) => {
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
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item.ticketDays = Math.ceil((todayBegin - item.orderTime) / aDay);
                item._status = wx.jyApp.constData.applyOrderStatusMap[item.status];
                item.applyTicketVisible = item.ticketDays <= this.data.configData.allowApplyTicketDays && item.price > 0 && item.status == 2 || false;
                item.delVisible = [2, 5].indexOf(item.status) > -1;
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                this.setStatusColor(item, 'apply');
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
    },
    setStatusColor(order, type) {
        if (type == 'interrogation') {
            switch (order.status) {
                case 0:
                case 6:
                case 7:
                    order.statusColor = 'danger-color';
                    break;
                case 1:
                case 3:
                    order.statusColor = 'success-color';
                    break;
            }
        } else if (type == 'apply') {
            switch (order.status) {
                case 0:
                case 1:
                case 4:
                case 5:
                    order.statusColor = 'danger-color';
                    break;
                case 2:
                    order.statusColor = 'success-color';
                    break;
            }
        } else if (type == 'mall') {
            switch (order.status) {
                case 0:
                case 5:
                case 6:
                    order.statusColor = 'danger-color';
                    break;
                case 1:
                case 7:
                case 8:
                    order.statusColor = 'success-color';
                    break;
            }
        }
    }
})