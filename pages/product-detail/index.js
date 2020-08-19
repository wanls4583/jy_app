import http from '../../utils/request';
import { store } from '../../store/index'
import { createStoreBindings } from 'mobx-miniprogram-bindings';

Page({
    data: {
        id: '',
        banner: [],
        desImgList: [],
        currentBannerIndex: 0,
        minOrderMoney: 0,
        deliveryMoney: 0,
        cartVisible: false,
        productInfo: {}
    },
    onLoad(option) {
        this.data.id = option.id;
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['cart', 'cartTotalMoney', 'cartNum'],
            actions: ['addCart', 'addCartNum', 'reduceCartNum', 'clearCart'],
        });
        this.loadInfo();
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
        http({
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
        wx.navigateTo({
            url: '/pages/cart/index'
        });
    }
})