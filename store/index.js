// store.js
import { observable, action } from 'mobx-miniprogram'

export const store = observable({
    cart: [],
    get cartNum() {
        var num = 0;
        this.cart.map((item) => {
            num += item.num;
        });
        return num;
    },
    get cartTotalMoney() {
        var money = 0;
        this.cart.map((item) => {
            money += item.product.price * item.num;
        });
        return money.toFixed(2);
    },
    addCart: action(function(product) {
        var temp = this.cart.filter((item) => {
            return item.product.id == product.id;
        });
        if (temp.length) {
            temp[0].num++;
        } else {
            product.firstPic = product.goodsPic.split(',')[0];
            this.cart.push({
                product: product,
                num: 1
            });
        }
        this.cart = this.cart.concat([]);
    }),
    addCartNum: action(function(id) {
        var temp = this.cart.filter((item) => {
            return item.product.id == id;
        });
        if (temp.length) {
            temp[0].num++;
        }
        this.cart = this.cart.concat([]);
    }),
    reduceCartNum: action(function(id) {
        for (var i = 0; i < this.cart.length; i++) {
            if (this.cart[i].product.id == id) {
                this.cart[i].num--;
                if (this.cart[i].num <= 0) {
                    this.cart.splice(i, 1);
                }
                break;
            }
        }
        this.cart = this.cart.concat([]);
    }),
    clearCart: action(function() {
        this.cart = [];
    }),
    defaultAddress: null,
    selectAddress: null,
    updateDefaultAddress: action(function(address) {
        this.defaultAddress = address;
    }),
    updateSelectAddress: action(function(address) {
        this.selectAddress = address;
    }),
    userInfo: null,
    updateUserInfo: action(function(userInfo) {
        this.userInfo = userInfo;
    }),
    doctorInfo: null,
    updateDoctorInfo: action(function(doctorInfo) {
        this.doctorInfo = doctorInfo;
    }),
    noticeCount: 0,
    updateNoticeCount: action(function(noticeCount) {
        this.noticeCount = noticeCount;
    })
})