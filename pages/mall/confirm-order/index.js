Page({
    data: {
        totalMoney: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'selectAddress', 'configData'],
            actions: ['addCart', 'clearCart', 'updateSelectAddress'],
        });
        this.storeBindings.updateStoreBindings();
        if (wx.jyApp.tempData.buyGoods) { //立即购买
            var goods = wx.jyApp.tempData.buyGoods;
            goods.selected = true;
            goods.count = 1;
            goods.amount = goods.price;
            goods.firstPic = goods.goodsPic && goods.goodsPic.split(',')[0] || '';
            this.setData({
                cart: [goods],
                cartTotalMoney: goods.price
            });
            delete wx.jyApp.tempData.buyGoods;
        }
        this.setData({
            totalMoney: (this.data.cartTotalMoney + Number(this.data.configData.deliveryCost || 0)).toFixed(2)
        });
        if (!this.data.selectAddress) {
            this.loadAddressList();
        }
    },
    onUnload() {
        this.updateSelectAddress(null);
        this.storeBindings.destroyStoreBindings();
    },
    onOpenWebView(e) {
        wx.jyApp.utils.openWebview(e);
    },
    onSelectAddress() {
        wx.jyApp.selectAddressFlag = true;
        wx.jyApp.utils.navigateTo({
            url: '/pages/mall/address-list/index'
        });
    },
    onSubmit() {
        if (!this.data.selectAddress) {
            wx.jyApp.toast('请先选择地址');
            return;
        }
        if (!this.data.cart.length) {
            wx.jyApp.toast('购物车为空');
            return;
        }
        var cart = this.data.cart.filter((item) => {
            return item.selected;
        });
        var goods = cart.map((item) => {
            return {
                amount: item.amount,
                goodsId: item.id,
                num: item.count
            }
        });
        wx.jyApp.showLoading('支付中...', true);
        this.checkStore().then((pass) => {
            pass && _submit.bind(this)();
        });
        // 提交
        function _submit() {
            wx.jyApp.http({
                url: '/order/save',
                method: 'post',
                data: {
                    addressId: this.data.selectAddress.id,
                    totalAmount: this.data.totalMoney,
                    goods: goods
                }
            }).then((data) => {
                wx.hideLoading();
                wx.jyApp.utils.pay(data.params).then(() => {
                    setTimeout(() => {
                        wx.showToast({
                            title: '支付成功'
                        });
                    }, 500);
                }).catch(() => {
                    setTimeout(() => {
                        wx.jyApp.toast('支付失败');
                    }, 500);
                }).finally(() => {
                    setTimeout(() => {
                        this.clearCart();
                        this.updateSelectAddress(null);
                    }, 500);
                    wx.redirectTo({
                        url: '/pages/mall/order-detail/index?type=mallOrder&id=' + data.id
                    });
                    var page = wx.jyApp.utils.getPages('pages/order-list/index');
                    if (page) {
                        page.loadMallOrderList(true);
                    }
                });
            }).catch(() => {
                wx.hideLoading();
            });
        }
    },
    // 检查库存
    checkStore() {
        var cart = this.data.cart.filter((item) => {
            return item.selected;
        });
        var ids = [];
        var idProductIdMap = {}; //商品id与productId的对应关系
        var productIdCountMap = {}; //productId与数量的对应关系
        cart.map((item) => {
            ids.push(item.id);
            if (!item.items) {
                idProductIdMap[item.id] = item.productId;
            }
        });
        return new Promise((resolve) => {
            wx.jyApp.http({
                url: '/goods/queryStock',
                data: {
                    ids: ids.join(',')
                }
            }).then((data) => {
                var storeProductIdCountMap = {};
                data = data.list;
                data.map((item) => {
                    if (item.items && item.items.length) { //套餐
                        item.items.map((_item) => {
                            storeProductIdCountMap[_item.productId] = _item.availNum;
                        });
                    } else {
                        var productId = idProductIdMap[item.id];
                        storeProductIdCountMap[productId] = item.availNum;
                    }
                });
                for (var i = 0; i < cart.length; i++) {
                    var item = cart[i];
                    var pass = true;
                    if (item.items && item.items.length) { //套餐
                        item.items.map((_item) => {
                            productIdCountMap[_item.productId] = productIdCountMap[_item.productId] || 0;
                            productIdCountMap[_item.productId] += _item.gross * item.count;
                            if (storeProductIdCountMap[_item.productId] === undefined) {
                                pass = false;
                                wx.hideLoading();
                                wx.jyApp.toast(item.goodsName + '库存查询失败');
                                return;
                            }
                            if (pass && productIdCountMap[_item.productId] > storeProductIdCountMap[_item.productId]) {
                                wx.hideLoading();
                                wx.jyApp.toast(item.goodsName + '库存不足');
                                pass = false;
                            }
                        });
                    } else {
                        productIdCountMap[item.productId] = productIdCountMap[item.productId] || 0;
                        productIdCountMap[item.productId] += item.count;
                        if (storeProductIdCountMap[item.productId] === undefined) {
                            pass = false;
                            wx.hideLoading();
                            wx.jyApp.toast(item.goodsName + '库存查询失败');
                            return;
                        }
                        if (pass && productIdCountMap[item.productId] > storeProductIdCountMap[item.productId]) {
                            wx.hideLoading();
                            wx.jyApp.toast(`${item.goodsName}太热销啦，仅剩下${storeProductIdCountMap[item.productId]}${wx.jyApp.constData.unitChange[item.useUnit]}`);
                            pass = false;
                        }
                    }
                    if (!pass) {
                        resolve(false);
                        return;
                    }
                }
                resolve(true);
            });
        });
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