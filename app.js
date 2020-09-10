//app.js
var loginUtil = require('./utils/login.js');
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { store } from './store/index';
import http from './utils/request';
import utils from './utils/util';
import * as constData from './utils/data';
import Dialog from '@vant/weapp/dialog/dialog';
import { Promise } from 'es6-promise';
App({
    onLaunch: function(option) {
        console.log(option);
        wx.jyApp = {};
        wx.jyApp.app = this;
        wx.jyApp.createStoreBindings = createStoreBindings;
        wx.jyApp.store = store;
        wx.jyApp.http = http;
        wx.jyApp.loginUtil = loginUtil;
        wx.jyApp.dialog = Dialog;
        wx.jyApp.constData = constData;
        wx.jyApp.utils = utils;
        wx.jyApp.Promise = Promise;
        wx.jyApp.toast = (msg) => {
                wx.showToast({
                    title: msg,
                    icon: 'none'
                });
            }
            // wx.setTabBarBadge({
            //   index: 2,
            //   text: '1'
            // });
    },
    onShow() {
        this.setGlobalData();
        this.updateCheck();
        this.getSwitchRoleStatus();
    },
    setGlobalData() {
        var systemInfo = wx.getSystemInfoSync();
        wx.jyApp.systemInfo = systemInfo;
    },
    //版本检测
    updateCheck() {
        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
            console.log('更新检测', res.hasUpdate)
        });

        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        });

        updateManager.onUpdateFailed(function() {
            // 新版本下载失败
            wx.showModal({
                title: '已经有新版本了哟~',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
        });
    },
    //获取切换角色状态开关(后台打开开关后，用户再次进入小程序时自动切换到医生状态)
    getSwitchRoleStatus() {
        if (wx.getStorageSync('token') && !wx.getStorageSync('role') && wx.jyApp.store.userInfo && wx.jyApp.store.userInfo.role != 'DOCTOR') {
            wx.jyApp.loginUtil.getUserInfo().then((data) => {
                if (data.info.role != 'DOCTOR' && data.info.switchStatus == 1) {
                    wx.setStorageSync('role', 'DOCTOR');
                    wx.jyApp.store.updateUserInfo(Object.assign({}, wx.jyApp.store.userInfo));
                }
            });
        }
    },
    globalData: {
        userInfo: null
    }
})

Number.prototype.toFixed = function(n, addZero) {
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
    wx.nextTick = function(cb) { setTimeout(() => { cb() }) }
}