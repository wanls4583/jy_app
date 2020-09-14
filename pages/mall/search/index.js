Page({
    data: {
        searchText: '',
        goodsName: '',
        doctorData: {
            list: [],
            page: 1,
            totalPage: -1
        },
        taocanData: {
            list: [],
            page: 1,
            totalPage: -1
        },
        productData: {
            list: [],
            page: 1,
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
        if (type == 1) {
            this.loadToacan();
        } else if (type == 2) {
            this.loadProduct();
        } else if (type == 3) {
            this.loadDoctor();
        }
    },
    onclickProdcut(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/product-detail/index?id=' + id
        });
    },
    search() {
        Promise.all([this.loadDoctor(true), this.loadProduct(true), this.loadToacan(true)]).then(() => {
            this.setData({
                searched: true
            });
        });
    },
    loadProduct(refresh) {
        if (this.data.productData.loading || !refresh && this.data.productData.page > this.data.productData.totalPage) {
            return;
        }
        if (refresh) {
            this.setData({
                productData: {
                    list: [],
                    page: 1,
                    totalPage: -1
                }
            });
        }
        this.data.productData.loading = true;
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.productData.page,
                limit: this.data.productData.page == 1 ? 3 : 6,
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
                [`productData.totalPage`]: data.page.totalPage
            });
        });
    },
    loadToacan(refresh) {
        if (this.data.taocanData.loading || !refresh && this.data.taocanData.page > this.data.taocanData.totalPage) {
            return;
        }
        if (refresh) {
            this.setData({
                taocanData: {
                    list: [],
                    page: 1,
                    totalPage: -1
                }
            });
        }
        this.data.taocanData.loading = true;
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.taocanData.page,
                limit: this.data.taocanData.page == 1 ? 3 : 6,
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
                [`taocanData.totalPage`]: data.page.totalPage
            });
        });
    },
    loadDoctor(refresh) {
        if (this.data.doctorData.loading || !refresh && this.data.doctorData.page > this.data.doctorData.totalPage) {
            return;
        }
        if (refresh) {
            this.setData({
                doctorData: {
                    list: [],
                    page: 1,
                    totalPage: -1
                }
            });
        }
        this.data.doctorData.loading = true;
        wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: this.data.doctorData.page,
                limit: this.data.doctorData.page == 1 ? 3 : 6,
                complexName: this.data.goodsName
            },
            complete: () => {
                this.data.doctorData.loading = false;
            }
        }).then((data) => {
            this.setData({
                [`doctorData.list`]: this.data.doctorData.list.concat(data.page.list || []),
                [`doctorData.page`]: this.data.doctorData.page + 1,
                [`doctorData.totalPage`]: data.page.totalPage
            });
        });
    }
})