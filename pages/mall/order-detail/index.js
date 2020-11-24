Page({
    data: {
        order: null
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'configData'],
            actions: ['addCart', 'updateCartNum', 'unSelectCart', 'selectCart']
        });
        this.storeBindings.updateStoreBindings();
        this.orderId = option.id;
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //支付商城订单
    onMallOrderPay(e) {
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/wx/pay/submit',
            method: 'post',
            data: {
                id: this.orderId
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.showToast({
                    title: '支付成功'
                });
                this.loadInfo();
                var page = wx.jyApp.utils.getPages('pages/order-list/index');
                if (page) {
                    page.updateMallStatus(this.orderId, 1);
                }
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
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
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        if (page) {
                            page.deleteMallItem(id);
                        }
                        wx.navigateBack();
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
                        this.data.order.status = 5;
                        this.data.order._status = wx.jyApp.constData.mallOrderStatusMap[5];
                        this.setStatusColor(this.data.order);
                        this.setData({
                            order: this.data.order
                        });
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        if (page) {
                            page.updateMallStatus(id, 5);
                        }
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    loadInfo() {
        !this.loaded && wx.showLoading({
            title: '加载中...'
        });
        wx.jyApp.http({
            url: `/order/info/${this.orderId}`
        }).then((data) => {
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.order._status = wx.jyApp.constData.mallOrderStatusMap[data.order.status];
            data.order.ticketMoney = Number((data.order.totalAmount - data.order.deliveryCost).toFixed(2));
            data.order.ticketDays = Math.ceil((todayBegin - data.order.orderTime) / aDay);
            data.order.applyTicketVisible = data.order.ticketDays <= this.data.configData.allowApplyTicketDays && data.order.totalAmount > 0 && data.order.status == 8 || false;
            data.order.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(data.order.status) > -1;
            data.order.delVisible = [0, 4, 6, 8].indexOf(data.order.status) > -1;
            data.order.orderTime = new Date(data.order.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
            data.order.goods.map((_item) => {
                _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
            });
            this.setStatusColor(data.order);
            this.loadExpress(data.order);
            this.setData({
                order: data.order
            });
        }).finally(() => {
            !this.loaded && wx.hideLoading();
            this.loaded = true;
        });
    },
    //获取物流信息
    loadExpress(order) {
        if (order.expressNumber) {
            wx.jyApp.http({
                url: '/express',
                data: {
                    expCode: 'SF',
                    expNo: order.expressNumber
                }
            }).then((data) => {
                this.setData({
                    'order.loadedTrace': true
                });
                this.setData({
                    'order.traces': JSON.parse(data.result).Traces
                });
            });
        }
    },
    setStatusColor(order) {
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
})