Page({
    data: {
        id: '',
        banner: [],
        desImgList: [],
        currentBannerIndex: 0,
        minOrderMoney: 0,
        deliveryMoney: 0,
        cartVisible: false,
        productInfo: {},
        bTop: 28,
        bHeight: 32
    },
    onLoad(option) {
        this.data.id = option.id;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'cartNum'],
            actions: ['addCart', 'addCartNum', 'reduceCartNum', 'clearCart'],
        });
        this.storeBindings.updateStoreBindings();
        this.setBackButtonRect();
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    setBackButtonRect() {
        var bRect = wx.getMenuButtonBoundingClientRect();
        var bTop = bRect && bRect.top || 28;
        var bHeight = bRect && bRect.height || 32;
        this.setData({
            bTop: bTop,
            bHeight: bHeight
        });
    },
    //返回
    onBack() {
        wx.navigateBack();
    },
    onBannerChang(e) {
        this.setData({
            currentBannerIndex: e.detail.current
        });
    },
    onShowCart() {
        if (!this.data.cartVisible && !this.data.cart.length) {
            return;
        }
        this.setData({
            cartVisible: !this.data.cartVisible
        });
    },
    onAddToCart(e) {
        this.addCart(this.data.productInfo);
    },
    onAddNum(e) {
        var id = e.currentTarget.dataset.id;
        this.addCartNum(id);
    },
    onReduceNum(e) {
        var id = e.currentTarget.dataset.id;
        this.reduceCartNum(id);
        if (!this.data.cart.length) {
            this.setData({
                cartVisible: false
            });
        }
    },
    onClearCart() {
        this.clearCart();
        this.setData({
            cartVisible: false
        });
    },
    loadInfo() {
        wx.jyApp.http({
            url: `/goods/info/${this.data.id}`
        }).then((data) => {
            this.setData({
                productInfo: data.info,
                banner: data.info.goodsPic.split(','),
                desImgList: data.info.goodsPicDetails.split(','),
            });
        });
    },
    //点击商品图片放大
    onClickTopImg(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: this.data.banner // 需要预览的图片http链接列表
        });
    },
    //点击商品图片放大
    onClickDesImg(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: this.data.desImgList // 需要预览的图片http链接列表
        });
    },
    onPay() {
        if (this.data.cart.length) {
            wx.navigateTo({
                url: '/pages/mall/cart/index'
            });
        }
    }
})