Page({
    data: {},
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'cartNum', 'selectAddress'],
            actions: ['addCart', 'addCartNum', 'reduceCartNum', 'clearCart', 'updateSelectAddress'],
        });
        this.storeBindings.updateStoreBindings();
        if (!this.data.selectAddress) {
            this.loadAddressList();
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onSelectAddress() {
        wx.jyApp.selectAddressFlag = true;
        wx.navigateTo({
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
        var goods = this.data.cart.map((item) => {
            return {
                amount: item.totalAmount,
                goodsId: item.product.id,
                num: item.num
            }
        });
        wx.jyApp.http({
            url: '/order/save',
            method: 'post',
            data: {
                addressId: this.data.selectAddress.id,
                totalAmount: this.data.cartTotalMoney,
                goods: goods
            }
        }).then((data) => {
            var self = this;
            this.clearCart();
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
                wx.navigateTo({
                    url: '/pages/mall/order-detail/index?type=mallOrder&id=' + data.id
                });
            });
        });
    },
    loadAddressList() {
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            if (!this.selectAddress) {
                data.list.map((item) => {
                    if (item.isDefault) {
                        this.updateSelectAddress(item);
                    }
                });
            }
        });
    }
})