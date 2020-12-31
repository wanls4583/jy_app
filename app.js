//app.js
import loginUtil from './utils/login.js';
import log from './utils/log.js';
import {
    createStoreBindings
} from 'mobx-miniprogram-bindings';
import {
    store
} from './store/index';
import http from './utils/request';
import utils from './utils/util';
import * as constData from './utils/data';
import Dialog from '@vant/weapp/dialog/dialog';
import {
    Promise
} from 'es6-promise';
import config from './config/index';
import room from './utils/room';
App({
    onLaunch: function (option) {
        console.log(option);
        wx.jyApp = {};
        wx.jyApp.tempData = {}; //临时传输对象
        wx.jyApp.httpHost = config.httpHost;
        wx.jyApp.app = this;
        wx.jyApp.createStoreBindings = createStoreBindings;
        wx.jyApp.store = store;
        wx.jyApp.http = http;
        wx.jyApp.log = log;
        wx.jyApp.loginUtil = loginUtil;
        wx.jyApp.dialog = Dialog;
        wx.jyApp.constData = constData;
        wx.jyApp.utils = utils;
        wx.jyApp.room = room;
        wx.jyApp.Promise = Promise;
        wx.jyApp.toast = (msg) => {
            wx.showToast({
                title: msg,
                icon: 'none'
            });
        }
        wx.jyApp.showLoading = (title, mask) => {
            wx.showLoading({
                title: title,
                mask: Boolean(mask)
            });
        }
        wx.jyApp.setTempData = (prop, val) => {
            wx.jyApp.tempData[prop] = val;
        }
        wx.jyApp.getTempData = (prop, clear) => {
            var data = wx.jyApp.tempData[prop];
            clear && wx.jyApp.clearTempData(prop);
            return data;
        }
        wx.jyApp.clearTempData = (prop) => {
            delete wx.jyApp.tempData[prop];
        }
        this.firstLoad = true;
    },
    onShow() {
        this.setGlobalData();
        this.updateCheck();
        if (!this.firstLoad) {
            this.checkStatus();
        }
        this.firstLoad = false;
        wx.jyApp.utils.getAllConfig();
    },
    setGlobalData() {
        var systemInfo = wx.getSystemInfoSync();
        wx.jyApp.systemInfo = systemInfo;
    },
    //版本检测
    updateCheck() {
        var updateManager = wx.getUpdateManager();
        var self = this;

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log('更新检测', res.hasUpdate)
        });

        updateManager.onUpdateReady(function () {
            _showTip();

            function _showTip() {
                var pages = getCurrentPages();
                if (pages[pages.length - 1].route != 'pages/index/index') {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否重启应用？',
                        success(res) {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate()
                            }
                        }
                    });
                } else {
                    clearTimeout(self.updateTipTimer);
                    self.updateTipTimer = setTimeout(() => {
                        _showTip();
                    }, 1000);
                }
            }
        });

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
                title: '已经有新版本了哟~',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
        });
    },
    //检测状态
    checkStatus() {
        if (wx.getStorageSync('token')) {
            //检查用户状态
            wx.jyApp.loginUtil.getUserInfo().then((data) => {
                if (!wx.getStorageSync('role') && data.info.role == 'USER' && data.info.switchStatus == 1) {
                    wx.setStorageSync('role', 'DOCTOR');
                    data.info.role = 'DOCTOR';
                    wx.jyApp.store.updateUserInfo(data.info);
                }
                //检查医生状态
                if (data.info.doctorId || data.info.offlineDoctorId) {
                    var doctorId = wx.getStorageSync('doctorType') == 2 ? data.info.offlineDoctorId : data.info.doctorId;
                    wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
                        wx.jyApp.store.updateDoctorInfo(data.doctor);
                    });
                }
            });
        } else {
            wx.navigateTo({
                url: '/pages/index/index'
            });
        }
    },
    globalData: {
        userInfo: null
    }
})

Number.prototype.toFixed = function (n, addZero) {
    var value = this;
    var sign = value >= 0 ? 1 : -1;
    value = sign == 1 ? value : -value;
    var times = Math.pow(10, n)
    var des = value * times + 0.5
    des = parseInt(des, 10) / times
    des += '';
    var dotIndex = des.indexOf('.');
    if (addZero) {
        //尾部0不够
        if (dotIndex < 0 && n) {
            des += '.';
            for (var i = 0; i < n; i++) {
                des += '0';
            }
        } else if (des.slice(dotIndex + 1).length < n) {
            for (var i = 0, len = n - des.slice(dotIndex + 1).length; i < len; i++) {
                des += '0';
            }
        }
    }
    if (sign == -1) {
        des = '-' + des;
    }
    return des
}

if (!wx.nextTick) {
    wx.nextTick = function (cb) {
        setTimeout(() => {
            cb()
        })
    }
}