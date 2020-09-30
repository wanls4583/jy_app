Page({
    data: {
        settlementUrl: '',
        stopRefresh: false,
        userInfoButtonVisible: true
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo', 'noticeCount', 'configData'],
            actions: ['updateUserInfo', 'updateDoctorInfo', 'updateNoticeCount'],
        });
        this.storeBindings.updateStoreBindings();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        this.getMessageCount();
        if (wx.getStorageSync('hasPopUserAuth') == 1 || this.data.userInfo.avatarUrl) {
            this.setData({
                userInfoButtonVisible: false
            });
        }
    },
    onHide() {
        clearTimeout(this.pollCountTimer);
    },
    onRefresh() {
        wx.jyApp.Promise.all([
            this.reLogin(),
            this.getMessageCount(),
            wx.jyApp.utils.getAllConfig()
        ]).finally(() => {
            this.setData({
                stopRefresh: true
            })
        });
    },
    //页面跳转
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onGotoUser() {
        wx.navigateTo({
            url: '/pages/user/index'
        });
    },
    //跳转前检查医生状态
    onCheckGoto(e) {
        var incomeSwitch = e.currentTarget.dataset.incomeSwitch;
        if (wx.jyApp.utils.checkDoctor()) {
            if (incomeSwitch && this.data.doctorInfo.incomeSwitch != 1) {
                wx.jyApp.toast('该功能已关闭，请联系管理员！');
            } else {
                this.onGoto(e);
            }
        }
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    //切换账号
    onSitchRole() {
        if (this.data.userInfo.role == 'DOCTOR') {
            wx.setStorageSync('role', 'USER');
        } else {
            wx.setStorageSync('role', 'DOCTOR');
        }
        wx.reLaunch({
            url: '/pages/index/index'
        });
    },
    //拨打电话
    onClickPhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.configData.service_phone,
            complete: (msg) => {
                console.log(msg);
            }
        })
    },
    getWxUserInfo(e) {
        var userInfo = e.detail.userInfo;
        if (userInfo && !this.data.userInfo.avatarUrl) {
            userInfo.sex = userInfo.gender == 1 ? 1 : 0;
            userInfo.nickname = userInfo.nickName;
            wx.showLoading({
                title: '更新资料中...',
                mask: true
            });
            wx.jyApp.loginUtil.updateUserInfo(userInfo).then(() => {
                Object.assign(this.data.userInfo, userInfo);
                this.updateUserInfo(Object.assign({}, this.data.userInfo));
            }).finally(() => {
                wx.hideLoading();
                wx.navigateTo({ url: '/pages/user/index' });
            });
        } else {
            wx.navigateTo({ url: '/pages/user/index' });
        }
    },
    //重新登录
    reLogin() {
        return wx.jyApp.loginUtil.login().then(() => {
            return this.getUserInfo().then((data) => {
                return data.info.doctorId && wx.jyApp.loginUtil.getDoctorInfo(data.info.doctorId).then((data) => {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                });
            });
        });
    },
    //获取未读消息数量
    getMessageCount() {
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead'
        }).then((data) => {
            this.updateNoticeCount(data.totalNotRead || 0);
        })
    },
    //获取用户后台信息
    getUserInfo() {
        return wx.jyApp.loginUtil.getUserInfo().then((data) => {
            if (!data.info.nickname) {
                data.info.nickname = 'wx-' + wx.jyApp.utils.getUUID(8);
                wx.jyApp.loginUtil.updateUserInfo({
                    nickname: data.info.nickname
                });
            }
            var role = wx.getStorageSync('role');
            if (role == 'DOCTOR') {
                data.info.role = 'DOCTOR';
            } else if (role == 'USER') {
                data.info.role = 'USER';
            }
            this.updateUserInfo(data.info);
            return data;
        });
    },
})