Page({
    data: {
        totalMoney: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'cartSelectedNum'],
            actions: ['updateCartNum', 'selectCart', 'unSelectCart', 'deleteCart']
        });
        this.storeBindings.updateStoreBindings();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onPay() {
        if (this.data.cartSelectedNum > 0) {
            this.checkStore().then((pass) => {
                pass && wx.jyApp.utils.navigateTo({
                    url: '/pages/mall/confirm-order/index'
                });
            });
        } else {
            wx.jyApp.toast('请先选择商品');
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
                                wx.jyApp.toast(item.goodsName + '库存查询失败');
                                return;
                            }
                            if (pass && productIdCountMap[_item.productId] > storeProductIdCountMap[_item.productId]) {
                                wx.jyApp.toast(item.goodsName + '库存不足');
                                pass = false;
                            }
                        });
                    } else {
                        productIdCountMap[item.productId] = productIdCountMap[item.productId] || 0;
                        productIdCountMap[item.productId] += item.count;
                        if (storeProductIdCountMap[item.productId] === undefined) {
                            pass = false;
                            wx.jyApp.toast(item.goodsName + '库存查询失败');
                            return;
                        }
                        if (pass && productIdCountMap[item.productId] > storeProductIdCountMap[item.productId]) {
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
    onCartNumChange(e) {
        var id = e.currentTarget.dataset.id;
        this.updateCartNum(id, e.detail);
    },
    onCartSelect(e) {
        var item = e.currentTarget.dataset.item;
        if (!item.selected) {
            this.selectCart(item.id);
        } else {
            this.unSelectCart(item.id);
        }
    },
    onDelCart(e) {
        var id = e.currentTarget.dataset.id;
        this.deleteCart(id);
    }
})