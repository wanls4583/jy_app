Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        userInfo: null,
        messageCount: 0,
        doctor: {
            name: '医生名称',
            zhiwei: '主任医生',
            hospital: '医院名称',
            department: '科室名称'
        },
        banner: []
    },
    lifetimes: {
        attached() {
            var userInfo = wx.getStorageSync('userInfo')
            if (userInfo) {
                this.setData({
                    userInfo: userInfo
                })
            }
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_center.png",
                "selectedIconPath": "image/icon_center_active.png",
                "text": "患者管理"
            });
            this.loadBaner();
        }
    },
    methods: {
        onGoto(e) {
            var url = e.currentTarget.dataset.url;
            wx.navigateTo({
                url: url
            });
        },
        getUserInfo(e) {
            e.detail.userInfo.sex = e.detail.userInfo.gender == 1 ? 1 : 0;
            wx.setStorageSync('userInfo', e.detail.userInfo);
            this.setData({
                userInfo: e.detail.userInfo,
            });
            wx.jyApp.loginUtil.updateUserInfo(this.data.userInfo);
        },
        loadBaner() {
            wx.jyApp.http({
                url: '/banner/list',
                data: {
                    bannerCode: '0003'
                }
            }).then((data) => {
                this.setData({
                    banner: data.list
                });
            });
        },
        onClickBanner() {

        }
    }
})