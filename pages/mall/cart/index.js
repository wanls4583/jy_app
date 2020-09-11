Page({
    data: {
        totalMoney: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'cartNum', 'defaultAddress', 'selectAddress', 'configData'],
            actions: ['addCart', 'clearCart', 'updateDefaultAddress', 'updateSelectAddress'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            totalMoney: (this.data.cartTotalMoney + Number(this.data.configData.deliveryCost || 0)).toFixed(2)
        });
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
                totalAmount: this.data.totalMoney,
                goods: goods
            }
        }).then((data) => {
            this.clearCart();
            this.updateSelectAddress(null);
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
                wx.redirectTo({
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
                        this.updateDefaultAddress(item);
                    }
                });
            }
        });
    }
})