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
            actions: ['addCart', 'updateCartNum', 'clearCart', 'unSelectCart', 'selectCart']
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
    onGuide(e) {
        var order = e.currentTarget.dataset.order;
        wx.jyApp.setTempData('guidePatient', order.patient);
        wx.jyApp.utils.navigateTo(e, this);
    },
    //立即接诊
    onRecieve(e) {
        wx.jyApp.tempData.toRecieve = true;
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
        var type = e.currentTarget.dataset.type;
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
                this.updateInterrogationStatus(id, 1);
                if (type == 3) {
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/interrogation/apply-order-detail/index?id=${id}&type=interrogation`
                    });
                } else {
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/interrogation/chat/index?id=' + id
                    });
                }
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
                this.updateMallStatus(id, 1);
                wx.jyApp.utils.navigateTo({
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
            data.infos = data.infos || [];
            this.unSelectCart();
            data.infos.map((item) => {
                this.addCart(item);
                this.updateCartNum(item.id, countMap[item.id]);
                this.selectCart(item.id);
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
                wx.jyApp.utils.navigateTo({
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
                        this.deleteInterrogationItem(id);
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
                        this.deleteApplyItem(id);
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
                        this.deleteGuidanceItem(id);
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
                        this.deleteMallItem(id);
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
                        this.updateGuidanceStatus(id, 5);
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
                        this.updateMallStatus(id, 5);
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //修改处方单
    onEditOrder(e) {
        if (this.holding) {
            return;
        }
        this.holding = true;
        var id = e.currentTarget.dataset.id;
        wx.jyApp.http({
            url: '/nutritionorder/info/' + id
        }).then((data) => {
            wx.jyApp.setTempData('guideOrderDetail', data.detail);
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/medical-record/index'
            });
        }).finally((err) => {
            this.holding = false;
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
            var now = data.now;
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item.ticketDays = Math.ceil((todayBegin - item.orderTime) / aDay);
                item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                item.recieveAble = item.status == 1;
                if (item.type == 3) {
                    item.recieveAble = item.recieveAble && (item.videoBookDateTime - now) < 5 * 60 * 1000;
                }
                item.applyTicketVisible = item.ticketDays <= this.data.configData.allowApplyTicketDays && item.orderAmount > 0 && item.status == 3 || false;
                item.oneMoreVisible = [3, 4, 7].indexOf(item.status) > -1;
                item.delVisible = [0, 3, 4, 7].indexOf(item.status) > -1;
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                item.patient.BMI = (item.patient.weight) / (item.patient.height * item.patient.height / 10000);
                item.patient.BMI = item.patient.BMI && item.patient.BMI.toFixed(2) || '';
                if (item.videoBookDateTime) {
                    item.videoBookDateTime = new Date(item.videoBookDateTime);
                    item.videoBookDateTime = item.videoBookDateTime.formatTime('yyyy-MM-dd') + '&nbsp;' + wx.jyApp.constData.dayArr[item.videoBookDateTime.getDay()] + '&nbsp;' + item.videoBookDateTime.formatTime('hh:mm')
                }
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
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(2) || '';
                // item.age = new Date().getFullYear() - Date.prototype.parseDate(item.birthday).getFullYear();
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
                item.patient.BMI = (item.patient.weight) / (item.patient.height * item.patient.height / 10000);
                item.patient.BMI = item.patient.BMI && item.patient.BMI.toFixed(2) || '';
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
    //设置状态文字的颜色
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
    },
    //供其他页面更新列表发票状态
    updateTicketStatus(id, status) {
        this.data.interrogationOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.ticketStatus = status;
                this.setData({
                    [`interrogationOrder.orderList[${index}]`]: item
                });
            }
        });
        this.data.applyOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.ticketStatus = status;
                this.setData({
                    [`applyOrder.orderList[${index}]`]: item
                });
            }
        });
        this.data.guidanceOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.ticketStatus = status;
                this.setData({
                    [`guidanceOrder.orderList[${index}]`]: item
                });
            }
        });
        this.data.mallOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.ticketStatus = status;
                this.setData({
                    [`mallOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新评论状态为已评论
    updateAppraise(id) {
        this.data.interrogationOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.isAppraise = true;
                this.setStatusColor(item, 'interrogation');
                this.setData({
                    [`interrogationOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新接诊状态为已接诊
    updateRecieve(id) {
        this.data.interrogationOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.status = 5;
                item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                this.setStatusColor(item, 'interrogation');
                this.setData({
                    [`interrogationOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新商城订单状态
    updateApplyStatus(id, status) {
        this.data.applyOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.status = status;
                item.delVisible = [2, 5].indexOf(item.status) > -1;
                item._status = wx.jyApp.constData.applyOrderStatusMap[item.status];
                this.setStatusColor(item, 'apply');
                this.setData({
                    [`applyOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新指导订单状态
    updateGuidanceStatus(id, status) {
        this.data.guidanceOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.status = status;
                item.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(item.status) > -1;
                item.delVisible = [0, 4, 6, 8].indexOf(item.status) > -1;
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                this.setStatusColor(item, 'mall');
                this.setData({
                    [`guidanceOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新商城订单状态
    updateMallStatus(id, status) {
        this.data.mallOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.status = status;
                item.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(item.status) > -1;
                item.delVisible = [0, 4, 6, 8].indexOf(item.status) > -1;
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                this.setStatusColor(item, 'mall');
                this.setData({
                    [`mallOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面更新商城订单状态
    updateInterrogationStatus(id, status) {
        this.data.interrogationOrder.orderList.map((item, index) => {
            if (item.id == id) {
                item.status = status;
                item.oneMoreVisible = [3, 4, 7].indexOf(item.status) > -1;
                item.delVisible = [0, 3, 4, 7].indexOf(item.status) > -1;
                item._status = wx.jyApp.constData.interrogationOrderStatusMap[item.status];
                this.setStatusColor(item, 'interrogation');
                this.setData({
                    [`interrogationOrder.orderList[${index}]`]: item
                });
            }
        });
    },
    //供其他页面删除问诊订单item
    deleteInterrogationItem(id) {
        this.data.interrogationOrder.orderList = this.data.interrogationOrder.orderList.filter((item) => {
            return item.id != id;
        });
        if (!this.data.interrogationOrder.orderList) {
            this.data.interrogationOrder.totalPage = 0;
        }
        this.setData({
            interrogationOrder: this.data.interrogationOrder
        });
    },
    //供其他页面删除申请订单item
    deleteApplyItem(id) {
        this.data.applyOrder.orderList = this.data.applyOrder.orderList.filter((item) => {
            return item.id != id;
        });
        if (!this.data.applyOrder.orderList) {
            this.data.applyOrder.totalPage = 0;
        }
        this.setData({
            applyOrder: this.data.applyOrder
        });
    },
    //供其他页面删除营养处方订单item
    deleteGuidanceItem(id) {
        this.data.guidanceOrder.orderList = this.data.guidanceOrder.orderList.filter((item) => {
            return item.id != id;
        });
        if (!this.data.guidanceOrder.orderList) {
            this.data.guidanceOrder.totalPage = 0;
        }
        this.setData({
            guidanceOrder: this.data.guidanceOrder
        });
    },
    //供其他页面删除商城订单item
    deleteMallItem(id) {
        this.data.mallOrder.orderList = this.data.mallOrder.orderList.filter((item) => {
            return item.id != id;
        });
        if (!this.data.mallOrder.orderList) {
            this.data.mallOrder.totalPage = 0;
        }
        this.setData({
            mallOrder: this.data.mallOrder
        });
    }
})