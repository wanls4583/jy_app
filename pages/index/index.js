Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['authUserInfo'],
            actions: ['updateAuthUserInfo'],
        });
        wx.showLoading({
            title: '加载中...'
        });
        //登录检测
        wx.jyApp.loginUtil.checkLogin().then(() => {
            wx.jyApp.loginUtil.getAuthUserInfo().then((data) => {
                wx.hideLoading();
                this.updateAuthUserInfo(data.info);
                wx.switchTab({ url: '/pages/mall/home/index' });
            });
        }).catch((err) => {
            console.log(err);
        });
    },
})