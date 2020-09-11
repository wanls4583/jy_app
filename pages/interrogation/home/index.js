Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        banner: [],
        stopRefresh: false
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo', 'doctorInfo'],
                actions: ['updateDoctorInfo'],
            });
            this.storeBindings.updateStoreBindings();
            if (this.data.userInfo.role == 'DOCTOR') {
                this.loadBaner();
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onGoto(e) {
            var url = e.currentTarget.dataset.url;
            wx.navigateTo({
                url: url
            });
        },
        //跳转前检查医生状态
        onCheckGoto(e) {
            if (wx.jyApp.utils.checkDoctor()) {
                this.onGoto(e);
            }
        },
        onRefresh(e) {
            wx.jyApp.Promise.all([
                this.getDoctorInfo(),
                this.loadBaner
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                });
            });
        },
        onClickBanner(e) {
            var link = e.currentTarget.dataset.link;
            if (link) {
                wx.jyApp.utils.openWebview(link);
            }
        },
        //获取医生信息
        getDoctorInfo() {
            return wx.jyApp.loginUtil.getDoctorInfo(this.data.userInfo.doctorId).then((data) => {
                if (data.doctor) {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                }
            });
        },
        loadBaner() {
            return wx.jyApp.http({
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
    }
})