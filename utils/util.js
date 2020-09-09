function formatTime(date, format = 'yyyy-MM-dd hh:mm:ss') {
    if (this instanceof Date) {
        format = date || 'yyyy-MM-dd hh:mm:ss';
        date = this;
    } else {
        date = date instanceof Date ? date : new Date(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millis = date.getMilliseconds();
    format = format.replace('yyyy', year);
    format = format.replace('MM', ('0' + month).slice(-2));
    format = format.replace('dd', ('0' + day).slice(-2));
    format = format.replace('hh', ('0' + hour).slice(-2));
    format = format.replace('mm', ('0' + minute).slice(-2));
    format = format.replace('ss', ('0' + second).slice(-2));
    format = format.replace('SSS', millis);
    return format;
}

function parseDate(str, split) {
    var arr = str.split(split || '-');
    return new Date(Number(arr[0]), Number(arr[1]), Number(arr[2]));
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function getUUID(len) {
    len = len || 16;
    var str = '';
    for (var i = 0; i < len; i++) {
        str += (Math.random() * 16 | 0).toString(16);
    }
    return str;
}

function navigateTo(e) {
    var url = e.currentTarget.dataset.url;
    var type = e.currentTarget.dataset.type;
    if (type == 'tab') {
        wx.switchTab({
            url: url
        });
    } else {
        wx.navigateTo({
            url: url
        });
    }
}

function onInput(e, context) {
    var prop = e.currentTarget.dataset.prop;
    context.setData({
        [prop]: typeof e.detail == 'string' ? e.detail : e.detail.value
    });
}

function onInputNum(e, context, dot) {
    var prop = e.currentTarget.dataset.prop;
    var value = typeof e.detail == 'object' ? e.detail.value : e.detail;
    value = String(value);
    value = value.replace(/[^0123456789\.]/g, '');
    var reg = /^\d+(\.\d*)?$/;
    var r = reg.exec(value);
    var num = r && r[0] || '';
    if (dot === 0) { //整数
        num = parseInt(num) || '';
    } else {
        dot = dot || 2; //默认两位小数
        if (r && r[1] && r[1].length > (dot + 1)) {
            num = num.slice(0, num.length - (r[1].length - (dot + 1)));
        }
    }
    context.setData({
        [prop]: num
    });
}

function setText(inputParam) {
    wx.jyApp.inputParam = inputParam;
    wx.navigateTo({
        url: '/pages/input/index'
    });
}

function pay(params) {
    return new wx.jyApp.Promise((resolve, reject) => {
        wx.requestPayment({
            timeStamp: params.timeStamp,
            nonceStr: params.nonceStr,
            package: params.packageValue,
            signType: 'MD5',
            paySign: params.paySign,
            success(res) {
                resolve(res);
            },
            fail(res) {
                reject(res);
            }
        });
    });
}

function parseScene(scene) {
    var arr = scene.split(',');
    scene = {};
    arr.map((item) => {
        var tmp = item.split('=');
        scene[tmp[0]] = tmp[1];
    });
    return scene;
}

Date.prototype.formatTime = formatTime;
Date.prototype.parseDate = parseDate;

module.exports = {
    formatTime: formatTime,
    navigateTo: navigateTo,
    onInput: onInput,
    onInputNum: onInputNum,
    setText: setText,
    pay: pay,
    parseScene: parseScene,
    getUUID: getUUID
}