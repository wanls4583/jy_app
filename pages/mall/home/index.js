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
        tipVisible: false,
        searchOpacity: 0,
        minContentHeight: 0,
        menuRect: wx.jyApp.utils.getMenuRect()
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo', 'configData']
            });
            this.storeBindings.updateStoreBindings();
            this.setData({
                minContentHeight: wx.getSystemInfoSync().windowHeight - 80 - this.data.menuRect.outerNavHeight
            });
            if (this.data.userInfo.role != 'DOCTOR') {
                this.loadBaner();
                this.loadKepu();
                this.loadDoctor();
                this.loadDepartmentList();
            }
            if (this.data.userInfo.role == 'USER' && (this.data.userInfo.originRole == 'DOCTOR' || this.data.userInfo.switchStatus == 1) && !wx.getStorageSync('switch_role_tip')) {
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
    pageLifetimes: {
        show() {
            if (wx.jyApp.payInterrogationResult) { //问诊支付结果
                if (wx.jyApp.payInterrogationResult.result == 'fail') {
                    setTimeout(() => {
                        wx.jyApp.toast('支付失败');
                    }, 500);
                    wx.navigateTo({
                        url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.payInterrogationResult.id
                    });
                } else {
                    wx.navigateTo({
                        url: '/pages/interrogation/chat/index?id=' + wx.jyApp.payInterrogationResult.id
                    });
                }
                delete wx.jyApp.payInterrogationResult
            }
        }
    },
    methods: {
        onScroll(e) {
            var scrollTop = e.detail.scrollTop;
            var opacity = scrollTop / 40;
            opacity = opacity > 1 ? 1 : opacity;
            this.setData({
                searchOpacity: opacity
            });
        },
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onSearch(e) {
            var type = e.currentTarget.dataset.type;
            if (type == 1 && this.data.searchOpacity > 0.5 || type == 2 && 1 - this.data.searchOpacity > 0.5) {
                wx.jyApp.utils.navigateTo(e);
            }
        },
        onRefresh(e) {
            wx.jyApp.Promise.all([
                this.loadDoctor(),
                this.loadDepartmentList(),
                this.loadBaner(),
                this.loadKepu(),
                wx.jyApp.utils.getAllConfig()
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
                url: '/pages/mall/search-doctor/index?all=1'
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
                data.list = data.list || [];
                data.list = data.list.filter((item) => {
                    return item.status == 1;
                });
                data.list.map((item, index) => {
                    var _index = index % 3;
                    switch (_index) {
                        case 0:
                            item.background = 'background:linear-gradient(to right, #fbf9ea, #fdefbd)';
                            break;
                        case 1:
                            item.background = 'background:linear-gradient(to right, #eafbf1, #bdfde5)';
                            break;
                        case 2:
                            item.background = 'background:linear-gradient(to right, #eaf3fb, #bddcfd)';
                            break;
                    }
                });
                this.setData({
                    departmentList: data.list.slice(0, 6)
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
        }
    }
})