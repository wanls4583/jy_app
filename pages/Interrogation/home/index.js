Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        doctor: {},
        banner: []
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo']
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_users.png",
                "selectedIconPath": "image/icon_users_active.png",
                "text": "患者管理"
            });
            wx.nextTick(() => {
                if (this.data.userInfo.role == 'DOCTOR') {
                    this.loadBaner();
                    this.getDoctorInfo();
                }
            });
        }
    },
    pageLifetimes: {
        show() {
            // this.getDoctorInfo();
        }
    },
    methods: {
        onGoto(e) {
            var url = e.currentTarget.dataset.url;
            wx.navigateTo({
                url: url
            });
        },
        getDoctorInfo() {
            wx.showLoading({
                title: '加载中...',
                mask: true
            });
            wx.jyApp.http({
                url: `/doctor/info/${this.data.userInfo.id}`
            }).then((data) => {
                if (data.doctor) {
                    this.setData({
                        doctor: data.doctor
                    });
                }
            }).finally(() => {
                wx.hideLoading();
            });
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