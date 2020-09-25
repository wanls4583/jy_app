Page({
    data: {},
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
    },
    onShow() {
        if (this.data.userInfo.role == 'DOCTOR') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#2aafff'
            });
            wx.setBackgroundColor({
                backgroundColor: '#2aafff',
                backgroundColorTop: '#2aafff'
            });
            wx.setBackgroundTextStyle({
                textStyle: 'light'
            });
            wx.setNavigationBarTitle({
                title: ''
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_users.png",
                "selectedIconPath": "image/icon_users_active.png",
                "text": "患者管理"
            });
        } else {
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            });
            wx.setBackgroundColor({
                backgroundColor: '#ffffff',
                backgroundColorTop: '#ffffff'
            });
            wx.setBackgroundTextStyle({
                textStyle: 'dark'
            });
            wx.setNavigationBarTitle({
                title: '钜元云营养'
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_marks.png",
                "selectedIconPath": "image/icon_marks_active.png",
                "text": "商城"
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShareAppMessage: function (res) {
        return {
            title: '钜元云营养',
            path: '/pages/index/index',
            imageUrl: '/image/logo.png'
        }
    },
})