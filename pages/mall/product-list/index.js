Page({
    data: {
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
        wrapHeight: 0,
        productVisible: false,
        taocanVisible: false
    },
    onLoad(option) {
        if (option && option.type == 1) {
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
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.Promise.all([
            this.loadList(false, 2),
            this.loadList(false, 1)
        ]).finally(() => {
            this.setData({
                productVisible: this.data.productData.totalPage > 0,
                taocanVisible: this.data.taocanData.totalPage > 0
            });
            wx.hideLoading();
        });
    },
    onGotoSearch() {
        wx.navigateTo({
            url: '/pages/mall/search/index'
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
        if (type == 2) {
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
    //刷新对应tab
    onRefresh(e) {
        var type = e.currentTarget.dataset.type;
        this.loadList(true, type);
    },
    //刷新全部
    onRefreshAll() {
        wx.jyApp.Promise.all([
            this.loadList(false, 2),
            this.loadList(false, 1)
        ]).finally(() => {
            this.setData({
                productVisible: this.data.productData.totalPage > 0,
                taocanVisible: this.data.taocanData.totalPage > 0,
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
        if (type == 2) {
            if (this.data.taocanData.loading || !refresh && this.data.taocanData.totalPage > -1 && this.data.taocanData.page > this.data.taocanData.totalPage) {
                return Promise.reject();
            }
            this.data.taocanData.loading = true;
            var page = refresh ? 1 : this.data.taocanData.page;
            this.request2 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 3,
                    side: 'USER'
                },
                complete: () => {
                    this.data.taocanData.loading = false;
                }
            });
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
                return Promise.reject();
            }
            this.data.productData.loading = true;
            var page = refresh ? 1 : this.data.productData.page;
            this.request1 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 1,
                    side: 'USER'
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