Page({
    data: {
        id: '',
        banner: [],
        desImgList: [],
        currentBannerIndex: 0,
        cartVisible: false,
        productInfo: {},
        bTop: 28,
        bHeight: 32,
        needMoney: 0,
        count: 0,
        readonly: false
    },
    onLoad(option) {
        this.data.id = option.id;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['cart', 'cartTotalMoney', 'cartNum', 'configData'],
            actions: ['addCart', 'updateCartNum', 'clearCart'],
        });
        this.storeBindings.updateStoreBindings();
        this.data.configData.minOrderMoney = Number(this.data.configData.minOrderMoney) || 0;
        this.setBackButtonRect();
        this.loadInfo();
        this.setData({
            readonly: option.readonly || false,
            needMoney: Number(this.data.configData.minOrderMoney - wx.jyApp.store.cartTotalMoney).toFixed(2)
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        this.getProductNum();
    },
    onShareAppMessage: function (res) {
        return {
            title: this.data.productInfo.goodsName || '商品',
            path: '/pages/index/index?type=3&pId=' + this.data.id,
            imageUrl: this.data.banner[0] || '/image/logo.png'
        }
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
        this.setData({
            needMoney: Number(this.data.configData.minOrderMoney - wx.jyApp.store.cartTotalMoney).toFixed(2)
        });
        this.getProductNum();
    },
    onCartNumChange(e) {
        var id = e.currentTarget.dataset.id;
        this.updateCartNum(id, e.detail);
        if (wx.jyApp.store.cartNum <= 0) {
            this.setData({
                cartVisible: false,
            });
        }
        this.setData({
            needMoney: Number(this.data.configData.minOrderMoney - wx.jyApp.store.cartTotalMoney).toFixed(2)
        });
        this.getProductNum();
    },
    onClearCart() {
        this.clearCart();
        this.setData({
            cartVisible: false,
            count: 0
        });
    },
    loadInfo() {
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/goods/info/${this.data.id}`
        }).then((data) => {
            data.info._unit = data.info.type == 1 ? wx.jyApp.constData.unitChange[data.info.unit] : '份';
            this.setData({
                productInfo: data.info,
                banner: data.info.goodsPic && data.info.goodsPic.split(',') || [],
                desImgList: data.info.goodsPicDetails && data.info.goodsPicDetails.split(',') || [],
            });
            wx.hideLoading();
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
            if (this.data.needMoney <= 0) {
                wx.navigateTo({
                    url: '/pages/mall/cart/index'
                });
            }
        } else {
            wx.jyApp.toast('请先添加商品');
        }
    },
    //获取商品购买数量
    getProductNum() {
        wx.nextTick(() => {
            var count = 0;
            this.data.cart.map((item) => {
                if (item.id == this.data.productInfo.id) {
                    count = item.count;
                }
            });
            this.setData({
                count: count
            });
        });
    }
})