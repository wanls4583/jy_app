Page({
    data: {
        messageCount: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
    },
    getUserInfo(e) {
        var userInfo = e.detail.userInfo;
        if (userInfo && userInfo.avatarUrl != this.data.userInfo.avatarUrl) {
            userInfo.sex = userInfo.gender == 1 ? 1 : 0;
            userInfo.nickname = userInfo.nickName;
            wx.showLoading({
                title: '更新资料中...',
                mask: true
            });
            wx.jyApp.loginUtil.updateUserInfo(userInfo).then(() => {
                return wx.jyApp.loginUtil.getUserInfo().then((data) => {
                    wx.hideLoading();
                    this.updateUserInfo(data.info);
                });
            }).finally(() => {
                wx.navigateTo({ url: '/pages/user/index' });
            });
        } else {
            wx.navigateTo({ url: '/pages/user/index' });
        }

    },
    onGoto(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        });
    },
    onSitchRole() {
        if(this.data.userInfo.role == 'DOCTOR') {
            wx.setStorageSync('role', 'USER');
        } else {
            wx.setStorageSync('role', 'DOCTOR');
        }
        wx.navigateTo({
            url: '/pages/index/index'
        });
    }
})