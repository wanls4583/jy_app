Page({
    data: {
        active: 0,
        myProductData: {
            stopRefresh: false,
            pageList: {},
            page: 1,
            nowPage: 1,
            lastPage: 1,
            totalPage: -1
        },
        taocanData: {
            stopRefresh: false,
            pageList: {},
            page: 1,
            nowPage: 1,
            lastPage: 1,
            totalPage: -1
        },
        productData: {
            stopRefresh: false,
            pageList: {},
            page: 1,
            nowPage: 1,
            lastPage: 1,
            totalPage: -1
        },
        limit: 10,
        pageArr: [],
        wrapHeight: 0,
        productVisible: 0,
        taocanVisible: 0,
        myDataVisible: 0,
        stopRefresh: false
    },
    onLoad(option) {
        this.setData({
            from: option.from || ''
        });
        this.addedList = [];
        // 从我的产品跳转过来
        if (this.data.from === 'my-product') {
            wx.setNavigationBarTitle({
                title: '添加产品'
            });
            this.addedList = wx.getStorageSync('my-product-ids') || [];
        }
        var tmp = [];
        for (var i = 1; i <= 500; i++) {
            tmp.push(i);
        }
        this.setData({
            pageArr: tmp,
        });
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.Promise.all([
            this.loadList(false, 4),
            this.loadList(false, 2),
            this.loadList(false, 1)
        ]).finally(() => {
            this.setData({
                productVisible: this.data.productData.totalPage > 0 ? 1 : 0,
                taocanVisible: this.data.taocanData.totalPage > 0 ? 1 : 0,
                myDataVisible: this.data.from != 'my-product' && this.data.myProductData.totalPage > 0 ? 1 : 0
            });
            var toltalTab = this.data.myDataVisible + this.data.taocanVisible + this.data.productVisible;
            // 默认显示套餐tab
            if (option.type == 2 && this.data.taocanVisible && this.data.myDataVisible) {
                this.setData({
                    active: 1
                });
            }
            // 默认显示产品tab
            if (option.type == 1 && this.data.productVisible) {
                if (toltalTab >= 3) {
                    this.setData({
                        active: 2
                    });
                } else if (toltalTab >= 2) {
                    this.setData({
                        active: 1
                    });
                }
            }
            wx.hideLoading();
        });
    },
    onAddTaocan(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        var arr = wx.jyApp.diagnosisGoods.filter((_item) => {
            return _item.id == item.id && _item.type == item.type
        });
        if (!arr.length) {
            wx.jyApp.setTempData('usageGoods', item);
            if (item.type == 3) { //整取套餐
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/usage-comb/index'
                });
            } else if (item.type == 2) { //配制套餐
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/usage/index'
                });
            }
        } else {
            wx.jyApp.toast('已添加该套餐');
        }
    },
    onAddProduct(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        item.type = 1;
        var arr = wx.jyApp.diagnosisGoods.filter((_item) => {
            return _item.id == item.id && _item.type == item.type
        });
        if (!arr.length) {
            wx.jyApp.setTempData('usageGoods', item);
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/usage/index'
            });
        } else {
            wx.jyApp.toast('已添加该产品');
        }
    },
    // 添加到我的产品
    onAddMine(e) {
        var id = e.currentTarget.dataset.item.id;
        wx.jyApp.http({
            url: '/goodsdoctor/save',
            method: 'post',
            data: {
                goodsId: id
            }
        }).then(() => {
            this.changeAddFlag(id, true);
        });
    },
    // 删除我的产品
    onDelMine(e) {
        var id = e.currentTarget.dataset.item.id;
        wx.jyApp.http({
            url: '/goodsdoctor/delete',
            method: 'delete',
            data: {
                goodsId: id
            }
        }).then(() => {
            this.changeAddFlag(id, false);
        });
    },
    changeAddFlag(id, added) {
        for (var page in this.data.productData.pageList) {
            var list = this.data.productData.pageList[page];
            list = list || [];
            list.map((item, index) => {
                if (item.id == id) {
                    item.added = added
                    this.setData({
                        [`productData.pageList[${page}][${index}]`]: item
                    });
                }
            });
        }
        for (var page in this.data.taocanData.pageList) {
            var list = this.data.taocanData.pageList[page];
            list = list || [];
            list.map((item, index) => {
                if (item.id == id) {
                    item.added = added
                    this.setData({
                        [`taocanData.pageList[${page}][${index}]`]: item
                    });
                }
            });
        }
        var index = this.addedList.indexOf(id);
        if (added) {
            index == -1 && this.addedList.push(id);
        } else {
            index > -1 && this.addedList.splice(index, 1);
        }
        wx.setStorageSync('my-product-ids', this.addedList);
    },
    onGotoSearch() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/search/index?from=' + (this.data.from == 'my-product' ? 'add-product' : '')
        });
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onTaocanScroll(e) {
        this.computeScroll(e, 2);
    },
    onProductScroll(e) {
        this.computeScroll(e, 1);
    },
    //计算当前渲染的页码，每次渲染三页
    computeScroll(e, type) {
        var self = this;
        var scrollTop = e.detail.scrollTop;
        var nowPageKey = '';
        var data = null;
        if (type == 4) {
            data = this.data.myProductData;
            nowPageKey = 'myProductData.nowPage';
        } else if (type == 2) {
            data = this.data.taocanData;
            nowPageKey = 'taocanData.nowPage';
        } else {
            data = this.data.productData;
            nowPageKey = 'productData.nowPage';
        }
        _getItemHeight().then((itemHeight) => {
            var pageHeight = self.data.limit * itemHeight;
            var nowPage = Math.ceil(scrollTop / pageHeight);
            if (data.nowPage != nowPage) {
                self.setData({
                    [nowPageKey]: nowPage
                });
            }
        });
        //获取item的高度
        function _getItemHeight() {
            if (self.hasGetItemHeight) {
                return wx.jyApp.Promise.resolve(self.itemHeight);
            }
            return new wx.jyApp.Promise((resolve) => {
                var query = wx.createSelectorQuery()
                query.select('.product-item').boundingClientRect()
                query.exec(function (rect) {
                    if (rect && rect[0]) {
                        self.itemHeight = rect[0].height;
                        if (!self.data.wrapHeight) {
                            self.setData({
                                wrapHeight: self.itemHeight * self.data.limit
                            });
                            self.hasGetItemHeight = true;
                        }
                    }
                    resolve(self.itemHeight);
                });
            });
        }
    },
    onRefresh(e) {
        var type = e.currentTarget.dataset.type;
        this.loadList(true, type);
    },
    //刷新全部
    onRefreshAll() {
        wx.jyApp.Promise.all([
            this.loadList(false, 4),
            this.loadList(false, 2),
            this.loadList(false, 1)
        ]).finally(() => {
            this.setData({
                productVisible: this.data.productData.totalPage > 0 ? 1 : 0,
                taocanVisible: this.data.taocanData.totalPage > 0 ? 1 : 0,
                myDataVisible: this.data.from != 'my-product' && this.data.myProductData.totalPage > 0 ? 1 : 0,
                stopRefresh: true
            });
            wx.hideLoading();
        });
    },
    onLoadMore(e) {
        var type = e.currentTarget.dataset.type;
        this.loadList(false, type);
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    loadList(refresh, type) {
        var page = 0;
        if (type == 4) {
            if (this.data.from == 'my-product') {
                return wx.jyApp.Promise.resolve();
            }
            if (this.data.myProductData.loading || !refresh && this.data.myProductData.totalPage > -1 && this.data.myProductData.page > this.data.myProductData.totalPage) {
                return wx.jyApp.Promise.reject();
            }
            this.data.myProductData.loading = true;
            var page = refresh ? 1 : this.data.myProductData.page;
            this.request4 = wx.jyApp.http({
                url: '/goodsdoctor/list',
                complete: () => {
                    this.data.myProductData.loading = false;
                }
            })
            this.request4.then((data) => {
                if (refresh) {
                    this.setData({
                        myProductData: {
                            page: 1,
                            nowPage: 1,
                            lastPage: 1,
                            totalPage: -1,
                            pageList: {}
                        }
                    });
                }
                data.list.map((item) => {
                    item.goodsPic = item.goodsPic.split(',')[0];
                    if (item.type == 3) {
                        item._unit = '份';
                    } else {
                        item._unit = wx.jyApp.constData.unitChange[item.unit];
                    }
                });
                this.setData({
                    [`myProductData.pageList[${page}]`]: data.list || [],
                    [`myProductData.page`]: page + 1,
                    [`myProductData.lastPage`]: page,
                    [`myProductData.totalPage`]: 1
                });
            }).finally(() => {
                this.setData({
                    [`myProductData.stopRefresh`]: true
                });
            });
            return this.request4;
        } else if (type == 2) {
            if (this.data.taocanData.loading || !refresh && this.data.taocanData.totalPage > -1 && this.data.taocanData.page > this.data.taocanData.totalPage) {
                return wx.jyApp.Promise.reject();
            }
            this.data.taocanData.loading = true;
            var page = refresh ? 1 : this.data.taocanData.page;
            this.request2 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 3,
                    side: 'DOCTOR'
                },
                complete: () => {
                    this.data.taocanData.loading = false;
                }
            })
            this.request2.then((data) => {
                if (refresh) {
                    this.setData({
                        taocanData: {
                            page: 1,
                            nowPage: 1,
                            lastPage: 1,
                            totalPage: -1,
                            pageList: {}
                        }
                    });
                }
                data.page.list.map((item) => {
                    item.goodsPic = item.goodsPic.split(',')[0];
                    item._unit = '份';
                    // 已添加到我的产品
                    item.added = this.addedList.indexOf(item.id) > -1;
                });
                this.setData({
                    [`taocanData.pageList[${page}]`]: data.page.list || [],
                    [`taocanData.page`]: page + 1,
                    [`taocanData.lastPage`]: page,
                    [`taocanData.totalPage`]: data.page.totalPage
                });
            }).finally(() => {
                this.setData({
                    [`taocanData.stopRefresh`]: true
                });
            });
            return this.request2;
        } else {
            if (this.data.productData.loading || !refresh && this.data.productData.totalPage > -1 && this.data.productData.page > this.data.productData.totalPage) {
                return wx.jyApp.Promise.reject();
            }
            this.data.productData.loading = true;
            var page = refresh ? 1 : this.data.productData.page;
            this.request1 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 1,
                    side: 'DOCTOR'
                },
                complete: () => {
                    this.data.productData.loading = false;
                }
            });
            this.request1.then((data) => {
                if (refresh) {
                    this.setData({
                        productData: {
                            page: 1,
                            nowPage: 1,
                            lastPage: 1,
                            totalPage: -1,
                            pageList: {}
                        }
                    });
                }
                data.page.list.map((item) => {
                    item.goodsPic = item.goodsPic.split(',')[0];
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                    item._standardUnit = wx.jyApp.constData.unitChange[item.standardUnit];
                    // 已添加到我的产品
                    item.added = this.addedList.indexOf(item.id) > -1;
                });
                this.setData({
                    [`productData.pageList[${page}]`]: data.page.list || [],
                    [`productData.page`]: page + 1,
                    [`productData.lastPage`]: page,
                    [`productData.totalPage`]: data.page.totalPage
                });
            }).finally(() => {
                this.setData({
                    [`productData.stopRefresh`]: true
                });
            });
            return this.request1;
        }
    }
})