Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
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
            wx.jyApp.loginUtil.getUserInfo().then((data) => {
                wx.hideLoading();
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
                wx.switchTab({ url: '/pages/tab-bar-first/index' });
            });
        });
    },
})