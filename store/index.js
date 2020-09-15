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
        return Number(money.toFixed(2));
    },
    addCart: action(function (product) {
        var temp = this.cart.filter((item) => {
            return item.product.id == product.id;
        });
        product = Object.assign({}, product || {});
        if (temp.length) {
            temp[0].num++;
            temp[0].totalAmount = Number((temp[0].product.price * temp[0].num).toFixed(2));
        } else {
            product.firstPic = product.goodsPic && product.goodsPic.split(',')[0];
            product._unit = product.type == 1 ? wx.jyApp.constData.unitChange[product.unit] : '份';
            product._standardUnit = wx.jyApp.constData.unitChange[product.standardUnit];
            this.cart.push({
                product: product,
                num: 1,
                totalAmount: product.price
            });
        }
        this.cart = this.cart.concat([]);
    }),
    updateCartNum: action(function (id, num) {
        for (var i = 0; i < this.cart.length; i++) {
            if (this.cart[i].product.id == id) {
                if (num <= 0) {
                    this.cart.splice(i, 1);
                } else {
                    this.cart[i].totalAmount = Number((this.cart[i].product.price * num).toFixed(2));
                    this.cart[i].num = num;
                }
                break;
            }
        }
        this.cart = this.cart.concat([]);
    }),
    clearCart: action(function () {
        this.cart = [];
    }),
    selectAddress: null,
    updateSelectAddress: action(function (address) {
        this.selectAddress = address;
    }),
    userInfo: null,
    updateUserInfo: action(function (userInfo) {
        this.userInfo = userInfo;
    }),
    doctorInfo: null,
    updateDoctorInfo: action(function (doctorInfo) {
        this.doctorInfo = doctorInfo;
    }),
    noticeCount: 0,
    updateNoticeCount: action(function (noticeCount) {
        this.noticeCount = noticeCount;
    }),
    configData: {},
    updateConfigData: action(function (configData) {
        this.configData = configData;
    }),
})