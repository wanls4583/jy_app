Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onShow() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
        wx.showLoading({
            title: '加载中...'
        });
        //登录检测
        wx.jyApp.loginUtil.login().then(() => {
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
                }
                this.updateUserInfo(data.info);
                wx.switchTab({ url: '/pages/tab-bar-first/index' });
            });
        });
    },
})