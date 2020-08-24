const host = require('../config/index.js').httpHost;

function request(obj) {
    var header = obj.header || {};
    if (obj.method && obj.method.toLocaleUpperCase() == 'POST') {
        header['content-type'] = header['content-type'] || 'application/json'
    }
    header['token'] = wx.getStorageSync('token');
    return new Promise((resolve, reject) => {
        wx.request({
            url: host + obj.url,
            method: obj.method || 'get',
            header: header,
            data: obj.data,
            success: (res) => {
                if (res.data.code == 0) {
                    obj.success && obj.success(res.data);
                    resolve(res.data);
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none'
                    });
                    reject(res.data);
                    if (res.data.code == 401) {
                        wx.jyApp.loginUtil.login();
                    }
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
                    wx.showToast({
                        title: '服务器错误',
                        icon: 'none'
                    });
                }
                obj.complete && obj.complete(res);
            }
        });
    })
}

module.exports = request;