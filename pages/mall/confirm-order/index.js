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
        if(this.onSubmit.loading) {
            return;
        }
        this.onSubmit.loading = true;
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
        this.checkStore().then(() => {
            return _submit.bind(this)();
        }).finally(()=>{
            this.onSubmit.loading = false;
        });
        // 提交
        function _submit() {
            return wx.jyApp.http({
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
        return wx.jyApp.utils.checkStore(cart);
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