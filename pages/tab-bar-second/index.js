/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {

    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
    },
    onShow() {
        if (this.data.userInfo.role == 'DOCTOR') {
            wx.setNavigationBarTitle({
                title: '患者管理'
            });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_users.png",
                "selectedIconPath": "image/icon_users_active.png",
                "text": "患者管理",
                fail: () => { }
            });
        } else {
            wx.setNavigationBarTitle({
                title: '商城'
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#2aafff'
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_marks.png",
                "selectedIconPath": "image/icon_marks_active.png",
                "text": "商城",
                fail: () => { }
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    }
})