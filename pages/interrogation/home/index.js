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
                fields: ['userInfo'],
                actions: ['updateUserInfo'],
            });
            this.storeBindings.updateStoreBindings();
            if (this.data.userInfo.role == 'DOCTOR') {
                this.loadBaner();
                this.getDoctorInfo();
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
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
                    this.data.userInfo.balance = data.doctor.balance;
                    this.updateUserInfo(Object.assign({}, this.data.userInfo));
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