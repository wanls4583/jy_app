const host = require('../config/index.js').httpHost;

function request(obj) {
    var header = obj.header || {};
    if (obj.method && obj.method.toLocaleUpperCase() == 'POST') {
        header['content-type'] = header['content-type'] || 'application/json'
    }
    header['token'] = wx.getStorageSync('token');
    var requestTask = null;
    var promise = new Promise((resolve, reject) => {
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
                    wx.jyApp.toast(res.data.msg);
                    reject(res.data);
                    if (res.data.code == 401) { //登录失效
                        wx.navigateTo({
                            url: 'pages/index/index'
                        });
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
                    wx.jyApp.toast('服务器错误');
                }
                obj.complete && obj.complete(res);
            }
        });
    });
    promise.requestTask = requestTask;
    return promise;
}

module.exports = request;