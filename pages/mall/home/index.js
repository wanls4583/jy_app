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
        scrollTop: 0,
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
            if (this.data.userInfo.role == 'USER' &&
                (this.data.userInfo.originRole == 'DOCTOR' || this.data.userInfo.originRole == 'USER' && this.data.userInfo.switchStatus == 1) &&
                !wx.getStorageSync('switch_role_tip')) {
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
            if (wx.jyApp.tempData.payInterrogationResult) { //问诊支付结果
                if (wx.jyApp.tempData.payInterrogationResult.result == 'fail') {
                    setTimeout(() => {
                        wx.jyApp.toast('支付失败');
                    }, 500);
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.tempData.payInterrogationResult.id
                    });
                } else {
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/interrogation/chat/index?id=' + wx.jyApp.tempData.payInterrogationResult.id
                    });
                }
                delete wx.jyApp.tempData.payInterrogationResult
            }
        }
    },
    methods: {
        onScroll(e) {
            var scrollTop = e.detail.scrollTop;
            this.setData({
                scrollTop: scrollTop
            });
        },
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onSearch(e) {
            wx.jyApp.utils.navigateTo(e);
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
        onClickBanner(e) {
            var item = e.currentTarget.dataset.item;
            if (item.linkUrl && item.type != 2) {
                wx.jyApp.utils.openWebview(item.linkUrl);
            }
        },
        //查看更多
        onClickMore(e) {
            wx.jyApp.utils.navigateTo({
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