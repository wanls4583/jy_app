function checkLogin() {
    return checkSession().then(() => {
        return login();
    }).catch(() => {
        return checkAuthorize().then(() => {
            return getUserInfo();
        }).then(() => {
            return login();
        }).catch(() => {
            return login();
        });
    });
}

//检测session_key是否失效
function checkSession() {
    return new Promise((resolve, reject) => {
        wx.checkSession({
            success(res) {
                // session_key 未过期，并且在本生命周期一直有效
                resolve(res);
            },
            fail(err) {
                // session_key 已经失效，需要重新执行登录流程
                reject(err);
            }
        });
    });
}

//检测授权状态
function checkAuthorize() {
    return new Promise((resolve, reject) => {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    resolve(res);
                } else {
                    reject(res);
                }
            },
            fail: (err) => {
                reject(err);
            }
        })
    });
}

//获取用户基础信息
function getUserInfo() {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            success: (res) => {
                resolve(res.userInfo);
                wx.setStorageSync('userInfo', res.userInfo);
                res.userInfo.sex = e.detail.userInfo.gender == 1 ? 1 : 0;
                updateUserInfo(res.userInfo);
            },
            fail: (err) => {
                reject(err);
            }
        })
    });
}

//更新用户信息
function updateUserInfo(userInfo) {
    return wx.jyApp.http({
        url: '/wx/user/update',
        method: 'post',
        data: userInfo
    });
}

function getAuthUserInfo() {
    if(getAuthUserInfo.authUserInfo) {
        return Promise.resolve(getAuthUserInfo.authUserInfo);
    }
    return wx.jyApp.http({
        url: '/wx/user/info'
    }).then((data)=>{
        getAuthUserInfo.authUserInfo = data;
        return data;
    });
}

//登录
function login() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                resolve(res.code);
            },
            fail: (err) => {
                reject(err);
            }
        })
    }).then((code) => {
        return wx.jyApp.http({
            url: '/wx/login/auth',
            method: 'post',
            data: {
                code: code
            }
        }).then((data) => {
            wx.setStorageSync('token', data.token);
            login.logining = false;
            return Promise.resolve(data);
        }).catch(() => {
            wx.showToast({
                title: '登录失败'
            });
        });
    });
}

module.exports = {
    checkLogin: checkLogin,
    checkSession: checkSession,
    checkAuthorize: checkAuthorize,
    getUserInfo: getUserInfo,
    login: login,
    updateUserInfo: updateUserInfo,
    getAuthUserInfo: getAuthUserInfo
}