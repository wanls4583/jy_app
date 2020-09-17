Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        searchText: '',
        goodsName: '',
        taocanData: {
            list: [],
            page: 1,
            limit: 6,
            totalPage: -1
        },
        productData: {
            list: [],
            page: 1,
            limit: 6,
            totalPage: -1
        },
        searched: false
    },
    onLoad(option) {
        if (option && option.showDoctor) {
            this.setData({
                doctorVisible: true
            });
        }
    },
    onAddTaocan(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        item.type = 2;
        var arr = wx.jyApp.diagnosisGoods.filter((_item) => {
            return _item.id == item.id && _item.type == item.type
        });
        if (!arr.lenght) {
            wx.jyApp.diagnosisGoods.push(item);
            wx.jyApp.usageGoods = item;
            wx.redirectTo({
                url: '/pages/interrogation/usage/index'
            });
        }
    },
    onAddProduct(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        item.type = 1;
        var arr = wx.jyApp.diagnosisGoods.filter((_item) => {
            return _item.id == item.id && _item.type == item.type
        });
        if (!arr.lenght) {
            wx.jyApp.diagnosisGoods.push(item);
            wx.jyApp.usageGoods = item;
            wx.redirectTo({
                url: '/pages/interrogation/usage/index'
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
        var type = e.currentTarget.type;
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
        Promise.all([this.loadProduct(true), this.loadToacan(true)]).then(() => {
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
                    limit: 6,
                    totalPage: -1
                }
            });
        }
        this.data.productData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.productData.page,
                limit: this.data.productData.limit,
                type: 1,
                goodsName: this.data.goodsName
            },
            complete: () => {
                this.data.productData.loading = false;
            }
        }).then((data) => {
            data.page.list = data.page.list || [];
            if (refresh) {
                data.page.list = data.page.list.slice(0, 3);
            }
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = wx.jyApp.constData.unitChange[item.unit];
                item._standardUnit = wx.jyApp.constData.unitChange[item.standardUnit];
            });
            this.setData({
                [`productData.list`]: this.data.taocanData.page > 1 ? this.data.productData.list.concat(data.page.list) : data.page.list,
                [`productData.page`]: (!refresh || data.page.list.length < 3) ? this.data.productData.page + 1 : 1,
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
                    limit: 6,
                    totalPage: -1
                }
            });
        }
        this.data.taocanData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.taocanData.page,
                limit: this.data.taocanData.limit,
                type: 2,
                goodsName: this.data.goodsName
            },
            complete: () => {
                this.data.taocanData.loading = false;
            }
        }).then((data) => {
            data.page.list = data.page.list || [];
            if (refresh) {
                data.page.list = data.page.list.slice(0, 3);
            }
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = '份';
            });
            this.setData({
                [`taocanData.list`]: this.data.taocanData.page > 1 ? this.data.taocanData.list.concat(data.page.list) : data.page.list,
                [`taocanData.page`]: (!refresh || data.page.list.length < 3) ? this.data.taocanData.page + 1 : 1,
                [`taocanData.totalPage`]: data.page.totalPage
            });
        });
    }
})