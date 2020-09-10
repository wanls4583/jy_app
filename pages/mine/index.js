Page({
    data: {
        phone: '',
        settlementUrl: ''
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo', 'noticeCount'],
            actions: ['updateUserInfo', 'updateNoticeCount'],
        });
        this.storeBindings.updateStoreBindings();
        this.getPhone();
    },
    onShow() {
        this.getMessageCount();
    },
    onUnload() {
        clearTimeout(this.pollCountTimer);
        this.storeBindings.destroyStoreBindings();
    },
    getUserInfo(e) {
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
    getPhone() {
        wx.jyApp.utils.getConfig(['service_phone', 'settlement_url']).then((data) => {
            this.setData({
                phone: data.service_phone,
                settlementUrl: data.settlement_url
            });
        });
    },
    //获取未读消息数量
    getMessageCount() {
        wx.jyApp.http({
            url: '/systemnotice/totalNotRead'
        }).then((data) => {
            this.updateNoticeCount(data.totalNotRead || 0);
            clearTimeout(this.pollCountTimer);
            this.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 15000);
        })
    }
})