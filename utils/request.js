/*
 * @Author: lisong
 * @Date: 2020-11-02 15:12:40
 * @Description: 
 */
const httpHost = require('../config/index.js').httpHost;
const mobileHttpHost = require('../config/index.js').mobileHttpHost;

function request(obj) {
    var url = httpHost;
    var header = obj.header || {};
    if (obj.method && obj.method.toLocaleUpperCase() == 'POST') {
        header['content-type'] = header['content-type'] || 'application/json'
    }
    if (obj.type == 'mobile') {
        header['token'] = wx.getStorageSync('mobileToken');
        url = mobileHttpHost;
    } else {
        header['token'] = wx.getStorageSync('token');
        header['role'] = wx.getStorageSync('role');
        header['type'] = wx.getStorageSync('doctorType') == 2 ? 2 : 1;
    }
    var userInfo = wx.jyApp.store.userInfo;
    if (userInfo) {
        userInfo = {
            id: userInfo.id,
            doctorId: userInfo.doctorId,
            nickname: userInfo.nickname,
            role: userInfo.role,
        }
    } else {
        userInfo = {}
    }
    var requestTask = null;
    var promise = new wx.jyApp.Promise((resolve, reject) => {
        obj.data = obj.data || {};
        obj.data.ts = Date.now();
        requestTask = wx.request({
            url: url + obj.url,
            method: obj.method || 'get',
            header: header,
            data: obj.data,
            success: (res) => {
                if (res.data.code == 0) {
                    obj.success && obj.success(res.data);
                    resolve(res.data);
                } else {
                    if (!obj.hideTip && res.data.code != 401) {
                        setTimeout(() => { //延时提示，防止hideLoading干扰
                            res.data.msg && wx.jyApp.toast(res.data.msg);
                        }, 300);
                    }
                    reject(res.data);
                    if (obj.type != 'mobile' && (res.data.code == 401 || !wx.jyApp.store.userInfo)) { //未登陆
                        wx.removeStorageSync('token');
                        clearTimeout(wx.reLaunchTimer);
                        wx.reLaunchTimer = setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/index/index'
                            });
                        }, 1000);
                    }
                    if (obj.type == 'mobile' && res.data.code == 401) {
                        wx.removeStorageSync('mobileToken');
                        wx.reLaunch({
                            url: '/pages/clinical-nutrition/login/index'
                        });
                    }
                    wx.jyApp.log.info('服务器错误：', obj.url, obj.data, userInfo, res.data);
                }
            },
            fail: (err) => {
                obj.fail && obj.fail(err);
                reject(err);
            },
            complete: (res) => {
                if (res.statusCode != 200) {
                    obj.fail && obj.fail(res);
                    reject(res);
                    wx.jyApp.log.info('网络错误：', obj.url, obj.data, userInfo, res.statusCode);
                }
                obj.complete && obj.complete(res);
            }
        });
    });
    promise.requestTask = requestTask;
    return promise;
}

module.exports = request;