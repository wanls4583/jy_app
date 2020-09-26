//更新用户信息
function updateUserInfo(userInfo) {
    return wx.jyApp.http({
        url: '/wx/user/update',
        method: 'post',
        data: userInfo
    });
}

function getUserInfo() {
    return wx.jyApp.http({
        url: '/wx/user/info'
    }).then((data) => {
        if (data && data.info) {
            data.info.originRole = data.info.role;
        }
        return data;
    });
}

function getDoctorInfo(doctorId) {
    if (!doctorId) {
        return Promise.reject();
    }
    return wx.jyApp.http({
        url: `/doctor/info/${doctorId}`
    }).then((data) => {
        return data;
    });
}

//登录
function login(param) {
    return new wx.jyApp.Promise((resolve, reject) => {
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
                code: code,
                ...param
            }
        }).then((data) => {
            wx.setStorageSync('token', data.token);
            login.logining = false;
            return wx.jyApp.Promise.resolve(data);
        }).catch(() => {
            wx.showToast({
                title: '登录失败'
            });
        });
    });
}

module.exports = {
    login: login,
    updateUserInfo: updateUserInfo,
    getDoctorInfo: getDoctorInfo,
    getUserInfo: getUserInfo
}