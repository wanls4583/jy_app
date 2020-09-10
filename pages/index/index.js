Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
            actions: ['updateUserInfo', 'updateDoctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        if (option.type == 'invite' && option.doctorId) { //医生通过好友分享邀请
            this.inviteId = option.doctorId;
            this.inviteWay = 1;
        } else if (option.scene) {
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            if (param.type == 'invite' && param.doctorId) { //医生通过二维码分享邀请
                this.inviteId = param.doctorId;
                this.inviteWay = 2;
            }
        }
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
                this.getDoctorInfo(data.info.doctorId);
            }).finally(() => {
                wx.hideLoading();
                wx.switchTab({ url: '/pages/tab-bar-first/index' });
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
    //获取医生信息
    getDoctorInfo(doctorId) {
        if (!doctorId) {
            return Promise.resolve();
        }
        return wx.jyApp.http({
            hideTip: true,
            url: `/doctor/info/${doctorId}`
        }).then((data) => {
            if (data.doctor) {
                this.updateDoctorInfo(Object.assign({}, data.doctor));
            }
        });
    },
})