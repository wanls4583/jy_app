Page({
    data: {
        phone: '',
        settlementUrl: '',
        stopRefresh: false
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo', 'noticeCount'],
            actions: ['updateUserInfo', 'updateNoticeCount'],
        });
        this.storeBindings.updateStoreBindings();
        this.getConfig();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        this.getMessageCount();
    },
    onHide() {
        clearTimeout(this.pollCountTimer);
    },
    onRefresh() {
        wx.jyApp.Promise.all([
            this.reLogin(),
            this.getConfig(),
            this.getMessageCount()
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
        wx.navigateTo({
            url: '/pages/index/index'
        });
    },
    //拨打电话
    onClickPhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        })
    },
    //获取客服电话
    getConfig() {
        return wx.jyApp.utils.getConfig(['service_phone', 'settlement_url']).then((data) => {
            this.setData({
                phone: data.service_phone,
                settlementUrl: data.settlement_url
            });
        });
    },
    getWxUserInfo(e) {
        var userInfo = e.detail.userInfo;
        if (userInfo && userInfo.avatarUrl && !this.data.userInfo.avatarUrl) {
            userInfo.sex = userInfo.gender == 1 ? 1 : 0;
            userInfo.nickname = userInfo.nickName;
            wx.showLoading({
                title: '更新资料中...',
                mask: true
            });
            wx.jyApp.loginUtil.updateUserInfo(userInfo).then(() => {
                return wx.jyApp.loginUtil.getUserInfo().then((data) => {
                    this.updateUserInfo(data.info);
                });
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
            return this.getUserInfo().then(() => {
                wx.nextTick(() => {
                    this.getDoctorInfo();
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
            clearTimeout(this.pollCountTimer);
            this.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 15000);
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
                wx.setStorageSync('role', 'USER');
            }
            this.updateUserInfo(data.info);
        });
    },
    //获取医生信息
    getDoctorInfo() {
        return wx.jyApp.http({
            hideTip: true,
            url: `/doctor/info/${this.data.userInfo.doctorId}`
        }).then((data) => {
            if (data.doctor) {
                this.updateDoctorInfo(Object.assign({}, data.doctor));
            }
        });
    },
})