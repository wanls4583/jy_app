import http from '../../utils/request';
const app = getApp()

Page({
    data: {
        id: '',
        banner: [],
        desImgList: [],
        currentBannerIndex: 0,
        deliveryFee: 12,
        cart: [{ name: '名称', price: 12, num: 10 }],
        cartVisible: false,
        productInfo: {}
    },
    onLoad(option) {
        this.data.id = option.id;
        this.loadInfo();
    },
    bannerChang(e) {
        this.setData({
            currentBannerIndex: e.detail.current
        });
    },
    showCart() {
        if(!this.data.cartVisible && !this.data.cart.length) {
            return;
        }
        this.setData({
            cartVisible: !this.data.cartVisible
        });
    },
    addNum(e) {
        var index = e.currentTarget.dataset.index;
        this.data.cart[index].num++;
        this.setData({
            [`cart[${index}]`]: this.data.cart[index]
        });
    },
    reduceNum(e) {
        var index = e.currentTarget.dataset.index;
        this.data.cart[index].num--;
        if (this.data.cart[index].num > 0) {
            this.setData({
                [`cart[${index}]`]: this.data.cart[index]
            });
        } else {
            this.data.cart.splice(index, 1)
            this.setData({
                cart: this.data.cart
            });
            if (!this.data.cart.length) {
                this.setData({
                    cartVisible: false
                });
            }
        }
    },
    clearCart() {
        this.setData({
            cart: [],
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
})