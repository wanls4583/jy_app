Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        banner: [],
        currentBannerIndex: 0,
        productList: [],
        taocanList: [],
        departmentList: [],
        doctorList: [],
        kepuList: []
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['authUserInfo']
            });
            wx.nextTick(() => {
                if (this.data.authUserInfo.role != 'DOCTOR') {
                    this.loadBaner();
                    this.loadKepu();
                    this.loadDoctor();
                    this.loadDepartmentList();
                }
            });
        }
    },
    methods: {
        onGotoSearch() {
            wx.navigateTo({
                url: '/pages/mall/search/index?showDoctor=1'
            });
        },
        bannerChang(e) {
            this.setData({
                currentBannerIndex: e.detail.current
            });
        },
        loadDoctor() {
            wx.jyApp.http({
                url: '/doctor/list',
                data: {
                    page: 1,
                    limit: 3
                }
            }).then((data) => {
                this.setData({
                    doctorList: data.page.list
                });
            })
        },
        loadDepartmentList() {
            wx.jyApp.http({
                url: '/department/list'
            }).then((data) => {
                this.setData({
                    departmentList: data.list
                });
            })
        },
        loadBaner() {
            wx.jyApp.http({
                url: '/banner/list',
                data: {
                    bannerCode: '0002'
                }
            }).then((data) => {
                this.setData({
                    banner: data.list
                });
            });
        },
        loadKepu() {
            wx.jyApp.http({
                url: '/banner/list',
                data: {
                    bannerCode: '0004'
                }
            }).then((data) => {
                this.setData({
                    kepuList: data.list
                });
            });
        },
        onClickDoctor(e) {
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/pages/interrogation/doctor-detail/index?id=' + id
            });
        },
        onClickBanner(e) {
            var link = e.currentTarget.dataset.link;
        },
        //查看更多
        onClickMore(e) {
            wx.navigateTo({
                url: '/pages/interrogation/search-doctor/index?'
            });
        }
    }
})