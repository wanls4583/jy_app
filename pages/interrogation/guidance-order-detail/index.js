Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['selectAddress', 'userInfo', 'configData'],
            actions: ['updateSelectAddress', 'addCart', 'updateCartNum', 'selectCart', 'unSelectCart'],
        });
        this.storeBindings.updateStoreBindings();
        if (!this.data.selectAddress) {
            this.loadAddressList();
        }
        this.id = option.id;
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        if (this.loaded) {
            this.loadInfo();
        }
    },
    //选择支付地址
    onSelectAddress() {
        wx.jyApp.selectAddressFlag = true;
        wx.jyApp.utils.navigateTo({
            url: '/pages/mall/address-list/index'
        });
    },
    //支付电子处方
    onGuidanceOrderPay() {
        if (!this.data.contactName && !this.data.selectAddress) {
            wx.jyApp.toast('请先选择收货地址');
            return;
        }
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/wx/pay/nutrition/submit',
            method: 'post',
            data: {
                addressId: this.data.selectAddress.id,
                orderId: this.id
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.showToast({
                    title: '支付成功'
                });
                this.loadInfo().then(() => {
                    this.updateSelectAddress(null);
                });
                var page = wx.jyApp.utils.getPages('pages/order-list/index');
                if (page) {
                    page.updateGuidanceStatus(this.id, 1);
                }
            }).catch(() => {
                this.loadInfo().then(() => {
                    this.updateSelectAddress(null);
                });
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
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        if (page) {
                            page.deleteGuidanceItem(id);
                        }
                        wx.navigateBack();
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
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        this.data.order.status = 5;
                        this.data.order._status = wx.jyApp.constData.mallOrderStatusMap[5];
                        this.setStatusColor(this.data.order);
                        this.setData({
                            order: this.data.order
                        });
                        if (page) {
                            page.updateGuidanceStatus(id, 5);
                        }
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    onGotoSheet(e) {
        this.onGoto(e);
    },
    //修改处方单
    onEditOrder(e) {
        wx.jyApp.setTempData('guideOrderDetail', this.data.order);
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/guidance-online/medical-record/index'
        });
    },
    loadInfo() {
        if (wx.jyApp.tempData.guidanceOrderData) {
            _initData.bind(this)(wx.jyApp.tempData.guidanceOrderData);
            delete wx.jyApp.tempData.guidanceOrderData;
            return;
        }
        if (!this.loaded) {
            wx.showLoading({
                title: '加载中...',
                mask: true
            });
        }
        return wx.jyApp.http({
            url: '/nutritionorder/info/' + this.id
        }).then((data) => {
            _initData.bind(this)(data);
        }).finally((err) => {
            !this.loaded && wx.hideLoading();
            this.loaded = true;
        });

        function _initData(data) {
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.detail._sex = data.detail.sex == 1 ? '男' : '女';
            data.detail.BMI = (data.detail.weight) / (data.detail.height * data.detail.height / 10000);
            data.detail.BMI = data.detail.BMI && data.detail.BMI.toFixed(2) || '';
            data.detail._status = wx.jyApp.constData.mallOrderStatusMap[data.detail.status];
            data.detail.ticketMoney = Number((data.detail.totalAmount - data.detail.deliveryCost).toFixed(2));
            data.detail.ticketDays = Math.ceil((todayBegin - Date.prototype.parseDateTime(data.detail.orderTime)) / aDay);
            data.detail.applyTicketVisible = data.detail.ticketDays <= this.data.configData.allowApplyTicketDays && data.detail.totalAmount > 0 && data.detail.status == 8 || false;
            data.detail.oneMoreVisible = [1, 4, 6, 7, 8].indexOf(data.detail.status) > -1;
            data.detail.delVisible = [10, 11].indexOf(data.detail.status) > -1;
            data.detail.goods.map((item) => {
                if(item.type == 1) {
                    item.goodsName = `${item.goodsName}(${item.items[0].standardNum}${wx.jyApp.constData.unitChange[item.standardUnit]}/${wx.jyApp.constData.unitChange[item.unit]})`;
                }
                item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                item._unit = wx.jyApp.constData.giveWayMap[item.giveWay];
                item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                if (item.type == 1) {
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                    item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                } else {
                    item.usage = `${item.days}天，${item._frequency}，每次1份，${Number(item.modulateDose) ? '配制' + item.modulateDose + '毫升，' : ''}${item._giveWay}`;
                    item._unit = '份';
                }
            });
            this.loadExpress(data.detail);
            this.setStatusColor(data.detail);
            this.setData({
                order: data.detail
            });
        }
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
    },
    loadAddressList() {
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            data.list = data.list || [];
            data.list.map((item) => {
                if (item.isDefault) {
                    this.updateSelectAddress(item);
                }
            });
            if (!wx.jyApp.store.selectAddress && data.list.length) {
                this.updateSelectAddress(data.list[0]);
            }
        });
    }
})