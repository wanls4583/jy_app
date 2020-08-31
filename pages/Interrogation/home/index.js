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
                fields: ['authUserInfo']
            });
            wx.setTabBarItem({
                index: 1,
                "iconPath": "image/icon_center.png",
                "selectedIconPath": "image/icon_center_active.png",
                "text": "患者管理"
            });
            wx.nextTick(() => {
                this.loadBaner();
                this.getDoctorInfo();
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
            wx.jyApp.http({
                url: '/doctor/info/' + this.data.authUserInfo.id
            }).then((data) => {
                this.setData({
                    doctor: data.doctor
                });
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