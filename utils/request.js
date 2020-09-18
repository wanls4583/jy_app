const host = require('../config/index.js').httpHost;

function request(obj) {
    var header = obj.header || {};
    if (obj.method && obj.method.toLocaleUpperCase() == 'POST') {
        header['content-type'] = header['content-type'] || 'application/json'
    }
    header['token'] = wx.getStorageSync('token');
    header['role'] = wx.getStorageSync('role');
    var requestTask = null;
    var promise = new wx.jyApp.Promise((resolve, reject) => {
        obj.data = obj.data || {};
        obj.data.ts = Date.now();
        requestTask = wx.request({
            url: host + obj.url,
            method: obj.method || 'get',
            header: header,
            data: obj.data,
            success: (res) => {
                if (res.data.code == 0) {
                    obj.success && obj.success(res.data);
                    resolve(res.data);
                } else {
                    if (!obj.hideTip) {
                        setTimeout(() => { //延时提示，防止hideLoading干扰
                            wx.jyApp.toast(res.data.msg);
                        }, 300);
                    }
                    reject(res.data);
                    if (res.data.code == 401) { //登录失效
                        wx.navigateTo({
                            url: '/pages/index/index'
                        });
                    }
                    wx.jyApp.log('服务器错误：', obj.url, res.data);
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
                    if (!obj.hideTip) {
                        setTimeout(() => { //延时提示，防止hideLoading干扰
                            wx.jyApp.toast('服务器错误');
                        }, 300);
                    }
                    wx.jyApp.log('网络错误：', obj.url, res.statusCode);
                }
                obj.complete && obj.complete(res);
            }
        });
    });
    promise.requestTask = requestTask;
    return promise;
}

module.exports = request;