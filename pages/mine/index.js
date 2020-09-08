Page({
    data: {
        messageCount: 0,
        phone: '',
        doctor: null
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.getPhone();
        this.getDoctorInfo();
    },
    onShow() {
        this.getMessageCount();
    },
    onUnload() {
        clearTimeout(this.pollCountTimer);
        this.storeBindings.destroyStoreBindings();
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
                    this.updateUserInfo(data.info);
                });
            }).finally(() => {
                wx.hideLoading();
                wx.navigateTo({ url: '/pages/user/index' });
            });
        } else {
            wx.navigateTo({ url: '/pages/user/index' });
        }

    },
    getDoctorInfo() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/approve/history'
        }).then((data) => {
            if (data.list) {
                for (var i = 0; i < data.list.length; i++) {
                    if (data.list[i].approveStatus == 2) {
                        this.setData({
                            doctor: data.list[i]
                        });
                        break;
                    }
                }
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
    //页面跳转
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //切换账号
    onSitchRole() {
        if (this.data.userInfo.role == 'DOCTOR') {
            wx.setStorageSync('role', 'USER');
        } else {
            wx.setStorageSync('role', 'DOCTOR');
        }
        wx.navigateTo({
            url: '/pages/index/index'
        });
    },
    //拨打电话
    onClickPhone() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        })
    },
    //获取客服电话
    getPhone() {
        wx.jyApp.http({
            url: '/sys/config/list',
            data: {
                configNames: 'servicePhone'
            }
        }).then((data) => {
            if (data.list.length) {
                this.setData({
                    phone: data.list[0].servicePhone
                });
            }
        })
    },
    //获取未读消息数量
    getMessageCount() {
        wx.jyApp.http({
            url: '/systemnotice/totalNotRead'
        }).then((data) => {
            this.setData({
                messageCount: data.totalNotRead || 0
            });
            clearTimeout(this.pollCountTimer);
            this.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 15000);
        })
    }
})