/*
 * @Author: lisong
 * @Date: 2020-11-02 15:12:40
 * @Description: 
 */
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
            if (data.info.role != 'DOCTOR') {
                data.info.role = 'USER';
            }
            if(data.info.originRole == 'PHARMACIST') {
                wx.removeStorageSync('role');
            }
            //后台删除医生后前端也需要删除医生信息
            if(!data.info.doctorId) {
                wx.jyApp.store.updateDoctorInfo(null);
            }
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
        });
    });
}

module.exports = {
    login: login,
    updateUserInfo: updateUserInfo,
    getDoctorInfo: getDoctorInfo,
    getUserInfo: getUserInfo
}