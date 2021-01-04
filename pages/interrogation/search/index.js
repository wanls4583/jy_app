Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        searchText: '',
        goodsName: '',
        taocanData: {
            list: [],
            renderList: [],
            page: 1,
            limit: 6,
            totalCount: 0,
            totalPage: -1
        },
        productData: {
            list: [],
            renderList: [],
            page: 1,
            limit: 6,
            totalCount: 0,
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
            wx.jyApp.setTempData('usageGoods', item);
            wx.jyApp.utils.navigateTo({
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
            wx.jyApp.setTempData('usageGoods', item);
            wx.jyApp.utils.navigateTo({
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
        }
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    search() {
        wx.jyApp.showLoading('搜索中...', true);
        wx.jyApp.Promise.all([this.loadProduct(true), this.loadToacan(true)]).then(() => {
            this.setData({
                searched: true,
                'taocanData.renderList': this.data.taocanData.list.slice(0, 3),
                'productData.renderList': this.data.productData.list.slice(0, 3),
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    loadProduct(refresh) {
        if (this.data.productData.loading || !refresh && this.data.productData.page > this.data.productData.totalPage) {
            return wx.jyApp.Promise.reject();
        }
        this.data.productData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: refresh ? 1 : this.data.productData.page,
                limit: this.data.productData.limit,
                type: 1,
                goodsName: this.data.goodsName,
                side: 'DOCTOR'
            },
            complete: () => {
                this.data.productData.loading = false;
            }
        }).then((data) => {
            if (refresh) {
                this.setData({
                    productData: {
                        list: [],
                        page: 1,
                        limit: 6,
                        totalCount: 0,
                        totalPage: -1
                    }
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = wx.jyApp.constData.unitChange[item.unit];
                item._standardUnit = wx.jyApp.constData.unitChange[item.standardUnit];
            });
            this.setData({
                [`productData.list`]: this.data.productData.list.concat(data.page.list),
                [`productData.page`]: this.data.productData.page + 1,
                [`productData.totalCount`]: data.page.totalCount,
                [`productData.totalPage`]: data.page.totalPage
            });
        });
    },
    loadToacan(refresh) {
        if (this.data.taocanData.loading || !refresh && this.data.taocanData.page > this.data.taocanData.totalPage) {
            return wx.jyApp.Promise.reject();
        }
        this.data.taocanData.loading = true;
        return wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: refresh ? 1 : this.data.taocanData.page,
                limit: this.data.taocanData.limit,
                type: 3,
                goodsName: this.data.goodsName,
                side: 'DOCTOR'
            },
            complete: () => {
                this.data.taocanData.loading = false;
            }
        }).then((data) => {
            if (refresh) {
                this.setData({
                    taocanData: {
                        list: [],
                        page: 1,
                        limit: 6,
                        totalCount: 0,
                        totalPage: -1
                    }
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                item._unit = '份';
            });
            this.setData({
                [`taocanData.list`]: this.data.taocanData.list.concat(data.page.list),
                [`taocanData.page`]: this.data.taocanData.page + 1,
                [`taocanData.totalCount`]: data.page.totalCount,
                [`taocanData.totalPage`]: data.page.totalPage
            });
        });
    }
})