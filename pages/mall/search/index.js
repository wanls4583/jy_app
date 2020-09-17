Page({
    data: {
        searchText: '',
        goodsName: '',
        doctorData: {
            list: [],
            renderList: [],
            page: 1,
            totalCount: 0,
            totalPage: -1
        },
        taocanData: {
            list: [],
            renderList: [],
            page: 1,
            totalCount: 0,
            totalPage: -1
        },
        productData: {
            list: [],
            renderList: [],
            page: 1,
            totalCount: 0,
            totalPage: -1
        },
        doctorVisible: false,
        searched: false
    },
    onLoad(option) {
        if (option && option.showDoctor) {
            this.setData({
                doctorVisible: true
            });
        }
    },
    onSearch() {
        this.setData({
            goodsName: this.data.searchText
        });
        this.search();
    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail
        });
    },
    onLoadMore(e) {
        var type = e.currentTarget.dataset.type;
        if (type == 2) {
            this.loadToacan().finally(() => {
                if (this.data.taocanData.renderList.length < this.data.taocanData.list.length) {
                    this.setData({
                        'taocanData.renderList': this.data.taocanData.list.slice(0, this.data.taocanData.renderList.length + 6)
                    });
                }
            });
        } else if (type == 1) {
            this.loadProduct().finally(() => {
                if (this.data.productData.renderList.length < this.data.productData.list.length) {
                    this.setData({
                        'productData.renderList': this.data.productData.list.slice(0, this.data.productData.renderList.length + 6)
                    });
                }
            });
        } else if (type == 3) {
            this.loadDoctor().finally(() => {
                if (this.data.doctorData.renderList.length < this.data.doctorData.list.length) {
                    this.setData({
                        'doctorData.renderList': this.data.doctorData.list.slice(0, this.data.doctorData.renderList.length + 6)
                    });
                }
            });
        }
    },
    onclickProdcut(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/product-detail/index?id=' + id
        });
    },
    onClickDoctor(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/doctor-detail/index?id=' + id
        });
    },
    search() {
        wx.jyApp.showLoading('搜索中...', true);
        Promise.all([this.loadDoctor(true), this.loadProduct(true), this.loadToacan(true)]).then(() => {
            this.setData({
                searched: true,
                'taocanData.renderList': this.data.taocanData.list.slice(0, 3),
                'productData.renderList': this.data.productData.list.slice(0, 3),
                'doctorData.renderList': this.data.doctorData.list.slice(0, 3),
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    loadProduct(refresh) {
        if (this.data.productData.loading || !refresh && this.data.productData.page > this.data.productData.totalPage) {
            return Promise.reject();
        }
        if (refresh) {
            this.setData({
                productData: {
                    list: [],
                    renderList: [],
                    page: 1,
                    totalPage: -1,
                    totalCount: 0
                }
            });
        }
        this.data.productData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.productData.page,
                limit: 10,
                type: 1,
                goodsName: this.data.goodsName
            },
            complete: () => {
                this.data.productData.loading = false;
            }
        }).then((data) => {
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = wx.jyApp.constData.unitChange[item.unit];
                item._standardUnit = wx.jyApp.constData.unitChange[item.standardUnit];
            });
            this.setData({
                [`productData.list`]: this.data.productData.list.concat(data.page.list),
                [`productData.page`]: this.data.productData.page + 1,
                [`productData.totalPage`]: data.page.totalPage,
                [`productData.totalCount`]: data.page.totalCount,
            });
        });
    },
    loadToacan(refresh) {
        if (this.data.taocanData.loading || !refresh && this.data.taocanData.page > this.data.taocanData.totalPage) {
            return Promise.reject();
        }
        if (refresh) {
            this.setData({
                taocanData: {
                    list: [],
                    renderList: [],
                    page: 1,
                    totalPage: -1,
                    totalCount: 0
                }
            });
        }
        this.data.taocanData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.taocanData.page,
                limit: 10,
                type: 2,
                goodsName: this.data.goodsName
            },
            complete: () => {
                this.data.taocanData.loading = false;
            }
        }).then((data) => {
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = '份';
            });
            this.setData({
                [`taocanData.list`]: this.data.taocanData.list.concat(data.page.list),
                [`taocanData.page`]: this.data.taocanData.page + 1,
                [`taocanData.totalPage`]: data.page.totalPage,
                [`taocanData.totalCount`]: data.page.totalCount,
            });
        });
    },
    loadDoctor(refresh) {
        if (this.data.doctorData.loading || !refresh && this.data.doctorData.page > this.data.doctorData.totalPage) {
            return Promise.reject();
        }
        if (refresh) {
            this.setData({
                doctorData: {
                    list: [],
                    renderList: [],
                    page: 1,
                    totalPage: -1,
                    totalCount: 0
                }
            });
        }
        this.data.doctorData.loading = true;
        return wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: this.data.doctorData.page,
                limit: 10,
                complexName: this.data.goodsName
            },
            complete: () => {
                this.data.doctorData.loading = false;
            }
        }).then((data) => {
            data.page.list = data.page.list || [];
            this.setData({
                [`doctorData.list`]: this.data.doctorData.list.concat(data.page.list),
                [`doctorData.page`]: this.data.doctorData.page + 1,
                [`doctorData.totalPage`]: data.page.totalPage,
                [`doctorData.totalCount`]: data.page.totalCount,
            });
        });
    }
})