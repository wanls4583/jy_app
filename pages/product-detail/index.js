const app = getApp()

Page({
    data: {
        userInfo: {},
        banner: [],
        currentBannerIndex: 0,
        deliveryFee: 12,
        cart: [{ name: '名称', price: 12, num: 10 }],
        cartVisible: false,
    },
    onLoad() {
        var arr = [];
        arr.push('https://p0.ssl.img.360kuai.com/dmfd/279_130_75/t0192175c6834d3154d.webp');
        arr.push('https://p0.ssl.img.360kuai.com/dmfd/279_130_75/t013ec44d9ead896780.webp');
        arr.push('https://p0.ssl.img.360kuai.com/dmfd/279_130_75/t012ce1413ee15a6935.webp');
        this.setData({
            banner: arr
        });
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
    }
})