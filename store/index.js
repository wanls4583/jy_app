// store.js
import { observable, action } from 'mobx-miniprogram'

export const store = observable({
    cart: [],
    get cartNum() {
        var count = 0;
        this.cart.map((item) => {
            count += item.count;
        });
        return count;
    },
    get cartTotalMoney() {
        var money = 0;
        this.cart.map((item) => {
            money += item.totalAmount;
        });
        return Number(money.toFixed(2));
    },
    addCart: action(function (product) {
        var temp = this.cart.filter((item) => {
            return item.id == product.id;
        });
        product = Object.assign({}, product || {});
        if (temp.length) {
            temp[0].count++;
            temp[0].totalAmount = Number((temp[0].price * temp[0].count).toFixed(2));
        } else {
            product.firstPic = product.goodsPic && product.goodsPic.split(',')[0];
            product._unit = product.type == 1 ? wx.jyApp.constData.unitChange[product.unit] : '份';
            product._standardUnit = wx.jyApp.constData.unitChange[product.standardUnit];
            product.totalAmount = product.price;
            product.count = 1;
            this.cart.push(product);
        }
        this.cart = this.cart.concat([]);
    }),
    updateCartNum: action(function (id, count) {
        for (var i = 0; i < this.cart.length; i++) {
            if (this.cart[i].id == id) {
                if (count <= 0) {
                    this.cart.splice(i, 1);
                } else {
                    this.cart[i].count = count;
                    this.cart[i].totalAmount = Number((this.cart[i].price * count).toFixed(2));
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
    msgCount: 0,
    updateMsgCount: action(function (msgCount) {
        this.msgCount = msgCount;
    }),
    configData: {},
    updateConfigData: action(function (configData) {
        this.configData = configData;
    }),
})