Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        banner: [],
        currentBannerIndex: 0,
        productList: [],
        taocanList: [],
        departmentList: [],
        doctorList: [],
        kepuList: [],
        stopRefresh: false,
        tipVisible: false
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo']
            });
            this.storeBindings.updateStoreBindings();
            if (this.data.userInfo.role != 'DOCTOR') {
                this.loadBaner();
                this.loadKepu();
                this.loadDoctor();
                this.loadDepartmentList();
            }
            if(this.data.userInfo.role == 'USER' && !wx.getStorageSync('switch_role_tip')) {
                this.setData({
                    tipVisible: true
                });
                wx.setStorageSync('switch_role_tip', 1);
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onRefresh(e) {
            wx.jyApp.Promise.all([
                this.loadDoctor(),
                this.loadDepartmentList(),
                this.loadBaner(),
                this.loadKepu()
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                });
            });
        },
        onClickHideTip() {
            this.setData({
                tipVisible: false
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
            if (link) {
                wx.jyApp.utils.openWebview(link);
            }
        },
        //查看更多
        onClickMore(e) {
            wx.navigateTo({
                url: '/pages/mall/search-doctor/index'
            });
        },
        loadDoctor() {
            return wx.jyApp.http({
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
            return wx.jyApp.http({
                url: '/department/list'
            }).then((data) => {
                data.list.map((item, index) => {
                    var _index = index % 3;
                    switch (_index) {
                        case 0:
                            item.background = 'background: linear-gradient(to right, rgb(33, 147, 176), rgb(109, 213, 237));';
                            break;
                        case 1:
                            item.background = 'background: linear-gradient(to right, rgb(0, 131, 176), rgb(0, 180, 219));';
                            break;
                        case 2:
                            item.background = 'background: linear-gradient(to right, rgb(41, 128, 185), rgb(109, 213, 250));';
                            break;
                    }
                });
                this.setData({
                    departmentList: data.list
                });
            })
        },
        loadBaner() {
            return wx.jyApp.http({
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
            return wx.jyApp.http({
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
    }
})