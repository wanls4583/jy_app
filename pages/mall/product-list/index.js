Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        searchText: '',
        goodsName: '',
        active: 0,
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
        wrapHeight: 0
    },
    onLoad(option) {
        if (option && option.type == 2) {
            this.setData({
                active: 1
            });
        }
        var tmp = [];
        for (var i = 1; i <= 500; i++) {
            tmp.push(i);
        }
        this.setData({
            pageArr: tmp,
        });
        this.loadList(false, 0);
        this.loadList(false, 1);
    },
    onSearch() {
        this.setData({
            goodsName: this.data.searchText
        });
        this.loadList(true, 0);
        this.loadList(true, 1);
    },
    onGotoSearch() {
        wx.navigateTo({
            url: '/pages/mall/search/index'
        });
    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail
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
        this.computeScroll(e);
    },
    onProductScroll(e) {
        this.computeScroll(e);
    },
    //计算当前渲染的页码，每次渲染三页
    computeScroll(e) {
        var self = this;
        var scrollTop = e.detail.scrollTop;
        var nowPageKey = '';
        var data = null;
        if (this.data.active == 0) {
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
                return Promise.resolve(self.itemHeight);
            }
            return new Promise((resolve) => {
                var query = wx.createSelectorQuery()
                query.select('.product').boundingClientRect()
                query.exec(function(rect) {
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
    onRefresh() {
        this.loadList(true, this.data.active);
    },
    onLoadMore() {
        this.loadList(false, this.data.active);
    },
    onclickProdcut(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/product-detail/index?id=' + id
        });
    },
    loadList(refresh, active) {
        var page = 0;
        if (active == 0) {
            if (this.data.taocanData.loading || !refresh && this.data.taocanData.totalPage > -1 && this.data.taocanData.page > this.data.taocanData.totalPage) {
                return;
            }
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
            this.data.taocanData.loading = true;
            page = this.data.taocanData.page;
            wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 2,
                    goodsName: this.data.goodsName
                },
                complete: () => {
                    this.data.taocanData.loading = false;
                }
            }).then((data) => {
                data.page.list.map((item) => {
                    item.goodsPic = item.goodsPic.split(',')[0];
                });
                this.setData({
                    [`taocanData.pageList[${page}]`]: data.page.list || [],
                    [`taocanData.page`]: page + 1,
                    [`taocanData.lastPage`]: page,
                    [`taocanData.totalPage`]: data.page.totalPage
                });
                if (refresh) {
                    this.setData({
                        [`taocanData.stopRefresh`]: true
                    });
                }
            }).finally(() => {
                if (refresh) {
                    this.setData({
                        [`taocanData.stopRefresh`]: true
                    });
                }
            });
        } else {
            if (this.data.productData.loading || !refresh && this.data.productData.totalPage > -1 && this.data.productData.page > this.data.productData.totalPage) {
                return;
            }
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
            this.data.productData.loading = true;
            page = this.data.productData.page;
            wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 1,
                    goodsName: this.data.goodsName
                },
                complete: () => {
                    this.data.productData.loading = false;
                }
            }).then((data) => {
                this.setData({
                    [`productData.pageList[${page}]`]: data.page.list || [],
                    [`productData.page`]: page + 1,
                    [`productData.lastPage`]: page,
                    [`productData.totalPage`]: data.page.totalPage
                });
                if (refresh) {
                    this.setData({
                        [`productData.stopRefresh`]: true
                    });
                }
            }).finally(() => {
                if (refresh) {
                    this.setData({
                        [`productData.stopRefresh`]: true
                    });
                }
            });
        }
    }
})