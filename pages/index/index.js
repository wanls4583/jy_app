Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onShow() {
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
                if (data.info.role == 'DOCTOR') {
                    wx.switchTab({ url: '/pages/interrogation/home/index' });
                    wx.setTabBarItem({
                        index: 0,
                        "pagePath": "pages/interrogation/home/index",
                        "iconPath": "image/icon_home.png",
                        "selectedIconPath": "image/icon_home_active.png",
                        "text": "首页"
                    });
                    wx.setTabBarItem({
                        index: 0,
                        "pagePath": "pages/interrogation/doctor-patient-list/index",
                        "iconPath": "image/icon_center_home.png",
                        "selectedIconPath": "image/icon_center_active.png",
                        "text": "患者管理"
                    });
                } else {
                    wx.switchTab({ url: '/pages/mall/home/index' });
                }
            });
        }).catch((err) => {
            console.log(err);
        });
    },
})