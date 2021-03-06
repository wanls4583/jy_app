// store.js
import {
    observable,
    action
} from 'mobx-miniprogram'

export const store = observable({
    cart: [],
    get cartNum() {
        return this.cart.length;
    },
    get cartSelectedNum() {
        var num = 0;
        this.cart.map((item) => {
            if (item.selected) {
                num++;
            }
        });
        return num;
    },
    get cartTotalMoney() {
        var money = 0;
        this.cart.map((item) => {
            if (item.selected) {
                money += item.amount;
            }
        });
        return Number(money.toFixed(2));
    },
    setCart: action(function (cart) {
        this.cart = this.cart;
    }),
    addCart: action(function (product) {
        var temp = this.cart.filter((item) => {
            return item.id == product.id;
        });
        product = Object.assign({}, product || {});
        if (temp.length) {
            temp[0].count++;
            temp[0].amount = Number((temp[0].price * temp[0].count).toFixed(2));
        } else {
            product.firstPic = product.goodsPic && product.goodsPic.split(',')[0];
            product._unit = product.type == 1 ? wx.jyApp.constData.unitChange[product.unit] : '份';
            product._standardUnit = wx.jyApp.constData.unitChange[product.standardUnit];
            product.amount = product.price;
            product.count = 1;
            this.cart.push(product);
        }
        this.cart = this.cart.concat([]);
        wx.jyApp.utils.storeLocalCart(this.cart);
    }),
    deleteCart: action(function (id) {
        this.cart = this.cart.filter((item) => {
            return item.id != id;
        });
        wx.jyApp.utils.storeLocalCart(this.cart);
    }),
    updateCartNum: action(function (id, count) {
        for (var i = 0; i < this.cart.length; i++) {
            if (this.cart[i].id == id) {
                if (count <= 0) {
                    this.cart.splice(i, 1);
                } else {
                    this.cart[i].count = count;
                    this.cart[i].amount = Number((this.cart[i].price * count).toFixed(2));
                }
                break;
            }
        }
        this.cart = this.cart.concat([]);
        wx.jyApp.utils.storeLocalCart(this.cart);
    }),
    clearCart: action(function (force) {
        if (force) { //清空所有
            this.cart = [];
        } else { //只清除下单了的商品
            this.cart = this.cart.filter((item) => {
                return !item.selected;
            });
        }
        wx.jyApp.utils.storeLocalCart(this.cart);
    }),
    selectCart: action(function (id) {
        this.cart.map((item) => {
            if (item.id == id || !id) {
                item.selected = true;
            }
        });
        this.cart = this.cart.concat([]);
        wx.jyApp.utils.storeLocalCart(this.cart);
    }),
    unSelectCart: action(function (id) {
        this.cart.map((item) => {
            if (item.id == id || !id) {
                item.selected = false
            }
        });
        this.cart = this.cart.concat([]);
        wx.jyApp.utils.storeLocalCart(this.cart);
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
    pharmacistInfo: null,
    updatePharmacistInfo: action(function (pharmacistInfo) {
        this.pharmacistInfo = pharmacistInfo;
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
    consultNum: {}, //医生会诊数量信息
    updateConsultNum: action(function (consultNum) {
        this.consultNum = consultNum;
    }),
    videoBookNum: 0,
    updateVideoBookNum: action(function (videoBookNum) {
        this.videoBookNum = videoBookNum;
    }),
    phoneBookNum: 0,
    updatePhoneBookNum: action(function (phoneBookNum) {
        this.phoneBookNum = phoneBookNum;
    }),
    allNutritionlist: [],
    updateAllNutritionlist: action(function (allNutritionlist) {
        this.allNutritionlist = allNutritionlist;
    }),
})