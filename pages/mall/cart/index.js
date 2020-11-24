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
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/confirm-order/index'
            });
        } else {
            wx.jyApp.toast('请先选择商品');
        }
    },
    onCartNumChange(e) {
        var id = e.currentTarget.dataset.id;
        this.updateCartNum(id, e.detail);
    },
    onCartSelect(e) {
        var item = e.currentTarget.dataset.item;
        if(!item.selected) {
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