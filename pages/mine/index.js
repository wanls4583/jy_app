const app = getApp()

Page({
    data: {
        userInfo: null
    },
    onLoad() {
        var userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({
                userInfo: userInfo
            })
        }
    },
    getUserInfo(e) {
        e.detail.userInfo.sex = e.detail.userInfo.gender == 1 ? 1 : 2;
        wx.setStorageSync('userInfo', e.detail.userInfo);
        this.setData({
            userInfo: e.detail.userInfo,
        });
        wx.jyApp.loginUtil.updateUserInfo(this.data.userInfo);
    },
    onClickAddress() {
        wx.navigateTo({
            url: '/pages/address-list/index'
        });
    }
})