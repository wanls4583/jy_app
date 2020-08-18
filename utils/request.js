const host = require('../config/index.js').httpHost;

function request(obj) {
    var header = obj.header || {};
    header.cookie = wx.getStorageSync('cookie');
    if (obj.method && obj.method.toLocaleUpperCase() == 'POST') {
        header['content-type'] = header['content-type'] || 'application/json'
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: host + obj.url,
            method: obj.method || 'get',
            header: header,
            data: obj.data,
            success: (res) => {
                if (res.data.code == 403) {
                    wx.showToast({
                        title: '登录已过期，请重新登录',
                        icon: 'none'
                    });
                }
                obj.success && obj.success(res.data);
                resolve(res.data);
            },
            fail: (err) => {
                obj.fail && obj.fail(err);
                reject(err);
            },
            complete: (res) => {
                if (res.statusCode != 200) {
                    obj.fail && obj.fail(res);
                    reject(err);
                }
                obj.complete && obj.complete(res);
            }
        });
    })
}

module.exports = request;