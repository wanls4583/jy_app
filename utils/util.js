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

function parseDate(str) {
    var reg = /\d{4}-\d{1,2}-\d{1,2}/.exec(str);
    if (reg) {
        var arr = reg[0].split('-');
        return new Date(Number(arr[0]), Number(arr[1]) - 1, Number(arr[2]));
    }
}

function parseDateTime(str) {
    var dateReg = /\d{4}-\d{1,2}-\d{1,2}/.exec(str);
    var timeReg = /\d{1,2}:\d{1,2}:\d{1,2}/.exec(str);
    if (dateReg && timeReg) {
        var arr1 = dateReg[0].split('-');
        var arr2 = timeReg[0].split(':');
        return new Date(Number(arr1[0]), Number(arr1[1]) - 1, Number(arr1[2]), Number(arr2[0]), Number(arr2[1]), Number(arr2[2]));
    } else if (dateReg) {
        return parseDate(str);
    }
}

function getTodayBegin() {
    var date = new Date();
    return date - date.getHours() * 60 * 60 * 1000 - date.getMinutes() * 60 * 1000 - date.getSeconds() * 1000 - date.getMilliseconds();
}

function countTime(seconds) {
    var hour = Math.floor(seconds / (60 * 60));
    var minute = Math.floor((seconds - hour * 60 * 60) / 60);
    var second = seconds - hour * 60 * 60 - minute * 60;
    second = Math.floor(second);
    var str = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2) + ':' + ('0' + second).slice(-2);
    return str;
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
    if (e.url) {
        if (e.type == 'tab') {
            wx.switchTab({
                url: e.url
            });
        } else {
            _navigateTo(e.url);
        }
        return;
    }
    var url = e.currentTarget.dataset.url;
    var type = e.currentTarget.dataset.type;
    if (type == 'tab') {
        wx.switchTab({
            url: url
        });
    } else {
        _navigateTo(url);
    }

    function _navigateTo(url) {
        if (!url) {
            return;
        }
        if (getCurrentPages().length > 9) {
            wx.redirectTo({
                url: url
            });
        } else {
            wx.navigateTo({
                url: url
            });
        }
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
        if (num) {
            num = parseInt(num);
        }
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

function pay(params, payCb) {
    return new wx.jyApp.Promise((resolve, reject) => {
        wx.requestPayment({
            timeStamp: params.timeStamp,
            nonceStr: params.nonceStr,
            package: params.packageValue,
            signType: 'MD5',
            paySign: params.paySign,
            success(res) {
                resolve(res);
                payCb && payCb();
            },
            fail(res) {
                reject(res);
            }
        });
    });
}

function parseScene(scene) {
    scene = decodeURIComponent(scene);
    var arr = scene.split(',');
    scene = {};
    arr.map((item) => {
        var tmp = item.split('=');
        scene[tmp[0]] = tmp[1];
    });
    return scene;
}

function openWebview(e) {
    var url = e;
    if (typeof e == 'object') {
        url = e.currentTarget.dataset.url;
    }
    if (url) {
        if (url.indexOf('/pages/') == 0) { //小程序内地址
            navigateTo({
                url: url
            });
        } else {
            url = encodeURIComponent(url);
            navigateTo({
                url: '/pages/web-view/index?url=' + url
            });
        }
    }
}

function getConfig(names) {
    return wx.jyApp.http({
        url: '/sys/config/list',
        data: {
            configNames: names.join(',')
        }
    }).then((data) => {
        var mapObj = {};
        if (data.list.length) {
            data.list.map((item) => {
                Object.assign(mapObj, item || {});
            })
        }
        return mapObj;
    })
}

function getAllConfig() {
    return getConfig([
        'service_phone',
        'settlement_url',
        'certification_url',
        'service_agreement_url',
        'privacy_agreement_url',
        'about_url',
        'minOrderMoney',
        'deliveryCost',
        'goodAtDomain',
        'informed_consent_url',
        'activity_rule_url',
        'h5_code_share_url',
        'consult_shop_url',
        'showDoctor',
        'hideAllBanner',
        'showInvite',
        'allowApplyTicketDays',
        'normalOrderExpireMinute',
        'nutritionOrderExpireDay',
        'consultOrderExpireMinute',
        'consultOrderCloseDay',
        'hideCategory',
        'jobTitle',
        'withdrawType'
    ]).then((data) => {
        data.consultOrderCloseHours = data.consultOrderCloseDay * 24 || 0;
        data.jobTitle = data.jobTitle && data.jobTitle.split('#') || [];
        wx.jyApp.store.updateConfigData(data);
    });
}

//使用医生功能时，检查医生状态
function checkDoctor(option = {
    hideTip: false,
    checkApprove: true,
    checkStatus: true
}) {
    var doctorInfo = wx.jyApp.store.doctorInfo;
    var pass = true;
    if ((!doctorInfo || doctorInfo.type != 2 && doctorInfo.authStatus != 1) && option.checkApprove) {
        !option.hideTip && wx.jyApp.dialog.confirm({
            message: '您未通过资质认证，认证后可使用该功能',
            confirmButtonText: '立即认证',
            cancelButtonText: '暂不认证',
            showCancelButton: !option.hideCancelButton
        }).then(() => {
            wx.navigateTo({
                url: '/pages/interrogation/certification/index'
            });
        });
        pass = false;
    }
    if (doctorInfo && doctorInfo.status == 3 && option.checkStatus) {
        !option.hideTip && wx.jyApp.dialog.confirm({
            message: '您的医生资质已被禁用，请联系客服人员解决',
            confirmButtonText: '联系客服',
            showCancelButton: !option.hideCancelButton
        }).then(() => {
            wx.makePhoneCall({
                phoneNumber: wx.jyApp.store.configData.service_phone
            });
        });
        pass = false;
    }
    return pass;
}

function getMenuRect() {
    var systemInfo = wx.getSystemInfoSync();
    var bRect = wx.getMenuButtonBoundingClientRect() || {};
    bRect.top = bRect && bRect.top || 28;
    bRect.right = bRect && bRect.right || systemInfo.screenWidth - 10;
    bRect.left = bRect && bRect.left || systemInfo.screenWidth - 97;
    bRect.height = bRect && bRect.height || 32;
    bRect.width = bRect && bRect.width || 87;
    bRect.navHeight = (bRect.top - systemInfo.statusBarHeight) * 2 + bRect.height;
    bRect.outerNavHeight = bRect.navHeight + systemInfo.statusBarHeight;
    bRect.marginRight = systemInfo.screenWidth - bRect.right;
    return bRect;
}

//订阅消息
function requestSubscribeMessage(tmplIds) {
    if (!(tmplIds instanceof Array)) {
        tmplIds = [tmplIds];
    }
    return new wx.jyApp.Promise((resolve, reject) => {
        if (tmplIds.length) {
            wx.requestSubscribeMessage({
                tmplIds: tmplIds,
                success(res) {
                    resolve(res)
                    console.log('订阅成功', res);
                },
                fail(err) {
                    reject(err);
                    console.log('订阅失败', err);
                }
            });
        } else {
            resolve();
        }
    });
}

function getPages(route) {
    var pages = getCurrentPages()
    if (typeof route == 'number') {
        return pages[route];
    }
    if (typeof route == 'string') {
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].route == route) {
                return pages[i];
            }
        }
    }
}
//存储本地购物车
function storeLocalCart(cart) {
    wx.setStorageSync('jy_cart', cart);
}
//获取本地购物车
function getLocalCart() {
    return wx.getStorageSync('jy_cart');
}
//判断value是否有值
function isNull(value) {
    return value === null || value === undefined
}
//获取营养素推荐值
function getSuggestData(name, patientDoc) {
    var result = null;
    if (!patientDoc) {
        return null;
    }
    wx.jyApp.constData.yingyangtuijian.map(item => {
        if (patientDoc.age >= item["maxAge"] && patientDoc.age <= item["minAge"] && patientDoc.sex == item["sex"]) {
            result = item[name];
        }
    })
    return result;
}

Date.prototype.formatTime = formatTime;
Date.prototype.parseDate = parseDate;
Date.prototype.parseDateTime = parseDateTime;
Date.prototype.getTodayBegin = getTodayBegin;
Date.prototype.countTime = countTime;

module.exports = {
    emailReg: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
    navigateTo: navigateTo,
    onInput: onInput,
    onInputNum: onInputNum,
    setText: setText,
    pay: pay,
    parseScene: parseScene,
    openWebview: openWebview,
    getConfig: getConfig,
    getAllConfig: getAllConfig,
    checkDoctor: checkDoctor,
    getMenuRect: getMenuRect,
    requestSubscribeMessage: requestSubscribeMessage,
    getPages: getPages,
    storeLocalCart: storeLocalCart,
    getLocalCart: getLocalCart,
    getUUID: getUUID,
    isNull: isNull,
    getSuggestData: getSuggestData
}