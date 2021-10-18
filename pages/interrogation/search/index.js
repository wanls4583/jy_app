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
        myProductData: {
            list: [],
            renderList: [],
        },
        searched: false
    },
    onLoad(option) {
        this.setData({
            from: option.from
        });
        this.addedList = [];
        // 从添加产品跳转过来
        if (this.data.from === 'add-product') {
            this.addedList = wx.getStorageSync('my-product-ids') || [];
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
        } else if (type == 4) {
            if (this.data.myProductData.renderList.length < this.data.myProductData.list.length) {
                this.setData({
                    'myProductData.renderList': this.data.myProductData.list.slice(0, this.data.myProductData.renderList.length + 6)
                });
            }
        }
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    // 添加到我的产品
    onAddMine(e) {
        var id = e.currentTarget.dataset.item.id;
        wx.jyApp.showLoading('添加中...');
        wx.jyApp.http({
            url: '/goodsdoctor/save',
            method: 'post',
            data: {
                goodsId: id
            }
        }).then(() => {
            wx.jyApp.toast('添加成功');
            this.changeAddFlag(id, true);
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page && page.route == "pages/interrogation/product-list/index") { //添加我的产品页面
                page.changeAddFlag(id, true);
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
    // 删除我的产品
    onDelMine(e) {
        var id = e.currentTarget.dataset.item.id;
        wx.jyApp.showLoading('删除中...');
        wx.jyApp.http({
            url: '/goodsdoctor/delete',
            method: 'delete',
            data: {
                goodsId: id
            }
        }).then(() => {
            wx.jyApp.toast('删除成功');
            this.changeAddFlag(id, false);
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page && page.route == "pages/interrogation/product-list/index") { //添加我的产品页面
                page.changeAddFlag(id, false);
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
    changeAddFlag(id, added) {
        var list = this.data.productData.renderList;
        list.map((item, index) => {
            if (item.id == id) {
                item.added = added
                this.setData({
                    [`productData.renderList[${index}]`]: item
                });
            }
        });
        list = this.data.taocanData.renderList;
        list.map((item, index) => {
            if (item.id == id) {
                item.added = added
                this.setData({
                    [`taocanData.renderList[${index}]`]: item
                });
            }
        });
        list = this.data.myProductData.renderList;
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.id == id) {
                this.data.myProductData.renderList.splice(i, 1);
                this.data.myProductData.list.splice(this.data.myProductData.list.indexOf(item), 1);
                this.setData({
                    'myProductData.renderList': this.data.myProductData.renderList,
                    'myProductData.list': this.data.myProductData.list
                })
                break;
            }
        }
        var index = this.addedList.indexOf(id);
        if (added) {
            index == -1 && this.addedList.push(id);
        } else {
            index > -1 && this.addedList.splice(index, 1);
        }
        wx.setStorageSync('my-product-ids',this.addedList);
    },
    search() {
        wx.jyApp.showLoading('搜索中...', true);
        wx.jyApp.Promise.all([this.loadProduct(true), this.loadToacan(true), this.loadMyProduct()]).then(() => {
            this.setData({
                searched: true,
                'taocanData.renderList': this.data.taocanData.list.slice(0, 3),
                'productData.renderList': this.data.productData.list.slice(0, 3),
                'myProductData.renderList': this.data.myProductData.list.slice(0, 3),
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
                item.added = this.addedList.indexOf(item.id) > -1;
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
                item.added = this.addedList.indexOf(item.id) > -1;
            });
            this.setData({
                [`taocanData.list`]: this.data.taocanData.list.concat(data.page.list),
                [`taocanData.page`]: this.data.taocanData.page + 1,
                [`taocanData.totalCount`]: data.page.totalCount,
                [`taocanData.totalPage`]: data.page.totalPage
            });
        });
    },
    loadMyProduct() {
        if (this.data.myProductData.loading) {
            return wx.jyApp.Promise.reject();
        }
        this.data.myProductData.request = wx.jyApp.http({
            url: '/goodsdoctor/list',
            complete: () => {
                this.data.myProductData.loading = false;
            }
        })
        this.data.myProductData.request.then((data) => {
            data.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                if (item.type == 3) {
                    item._unit = '份';
                } else {
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                }
            });
            this.setData({
                'myProductData.list': data.list,
                'myProductData.totalCount': data.list.length,
            });
        });
        return this.data.myProductData.request;
    }
})