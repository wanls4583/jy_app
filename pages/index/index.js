Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
            actions: ['updateUserInfo', 'updateDoctorInfo', 'updateNoticeCount'],
        });
        this.storeBindings.updateStoreBindings();
        if (option.type == 'invite' && option.userId) { //医生通过好友分享邀请
            this.inviteId = option.userId;
            this.inviteWay = 1;
        } else if (option.scene) {
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            console.log(param);
            if (param.type == 'invite' && param.userId) { //医生通过二维码分享邀请
                this.inviteId = param.userId;
                this.inviteWay = 2;
            } else if (param.type == 'card' && param.doctorId) {
                this.doctorId = param.doctorId;
            }
        }
        this.firstLoad = true;
        this.getConfig();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        wx.showLoading({
            title: '加载中...'
        });
        //登录检测
        wx.jyApp.loginUtil.login({
            inviteId: this.inviteId,
            inviteWay: this.inviteWay
        }).then(() => {
            this.getUserInfo().then((data) => {
                data.info.doctorId && wx.jyApp.loginUtil.getDoctorInfo(data.info.doctorId).then((data) => {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                });
            }).finally(() => {
                wx.hideLoading();
                this.getMessageCount();
                if (this.userId && this.firstLoad) {
                    wx.navigateTo({
                        url: '/pages/interrogation/doctor-detail/index?id=' + this.userId
                    });
                } else {
                    wx.switchTab({ url: '/pages/tab-bar-first/index' });
                }
                this.firstLoad = false;
            });
        });
    },
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
            if (!role && data.info.switchStatus == 1) {
                data.info.role = 'DOCTOR';
            }
            this.updateUserInfo(data.info);
            return data;
        });
    },
    getConfig() {
        wx.jyApp.utils.getConfig([
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
        ]).then((data) => {
            wx.jyApp.store.updateConfigData(data);
        });
    },
    getMessageCount() {
        var pages = getCurrentPages();
        if (pages.length > 1) {
            clearTimeout(wx.jyApp.pollCountTimer);
            wx.jyApp.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 5000);
            return Promise.resolve();
        }
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead',
            hideTip: true
        }).then((data) => {
            this.updateNoticeCount(data.totalNotRead || 0);
            if (data.msgTotalNotRead) {
                wx.setTabBarBadge({
                    index: 2,
                    text: String(data.msgTotalNotRead),
                    fail() { }
                });
            } else {
                wx.removeTabBarBadge({
                    index: 2,
                    fail() { }
                });
            }
        }).finally(() => {
            clearTimeout(wx.jyApp.pollCountTimer);
            wx.jyApp.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 5000);
        });
    }
})