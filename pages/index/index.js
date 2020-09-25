Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad(option) {
        console.log(option);
        this.option = option;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
            actions: ['updateUserInfo', 'updateDoctorInfo', 'updateNoticeCount', 'updateMsgCount'],
        });
        this.storeBindings.updateStoreBindings();
        this.getConfig();
        this.checkOption(this.option);
        this.firstLoad = true;
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
                if (this.url && this.firstLoad) {
                    wx.navigateTo({
                        url: this.url
                    });
                } else if (this.doctorId && this.firstLoad) {
                    wx.navigateTo({
                        url: '/pages/interrogation/doctor-detail/index?id=' + this.doctorId
                    });
                } if (this.productId && this.firstLoad) {
                    wx.navigateTo({
                        url: '/pages/mall/product-detail/index?id=' + this.productId
                    });
                } else {
                    wx.switchTab({ url: '/pages/tab-bar-first/index' });
                }
                this.firstLoad = false;
            });
        });
    },
    //检查启动参数
    checkOption(option) {
        console.log('检查启动参数');
        //type:{-1:直接跳转,1:邀请,2:医生主页, 3:产品主页}
        if (option.type == -1 && option.url) { //有page直接跳转
            this.url = decodeURIComponent(option.url);
        } else if (option.type == 1 && option.uId) { //医生通过好友分享邀请
            this.inviteId = option.uId;
            this.inviteWay = 1;
        } else if (option.type == 2 && option.dId) { //医生主页
            this.doctorId = option.dId;
        } else if (option.type == 3 && option.pId) { //产品主页
            this.productId = option.pId;
        } else if (option.scene) { //扫二维码进入
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            console.log(param);
            if (param.type == 1 && param.uId) { //医生通过二维码或名片分享邀请
                this.inviteId = param.uId;
                this.inviteWay = 2;
                this.doctorId = param.dId;
            }
        }
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
            'h5_code_share_url',
            'consult_shop_url',
            'showDoctor',
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
            this.updateMsgCount(data.msgTotalNotRead || 0);
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