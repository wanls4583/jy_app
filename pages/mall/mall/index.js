Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        banner: [],
        productList: [],
        taocanList: [],
        categoryList: [],
        categoryId: 0,
        scrollCategoryId: 0,
        topMenuVisible: false,
        stopRefresh: false,
        page: 1,
        size: 10,
        totalPage: -1,
        minContentHeight: 0,
        menuRect: wx.jyApp.utils.getMenuRect()
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['configData', 'cartNum']
            });
            this.storeBindings.updateStoreBindings();
            this.loadBaner();
            this.loadProduct();
            this.loadCategoryList();
            this.setData({
                minContentHeight: wx.getSystemInfoSync().windowHeight - 80 - this.data.menuRect.outerNavHeight
            });
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onRefresh(e) {
            this.setData({
                categoryId: 0
            });
            wx.jyApp.Promise.all([
                this.loadBaner(),
                this.loadProduct(true),
                this.loadCategoryList()
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                });
            });
        },
        onScroll(e) {
            var self = this;
            _getTop().then((top) => {
                this.setData({
                    topMenuVisible: top < this.data.menuRect.outerNavHeight ? true : false
                });
            });
            //获取item的高度
            function _getTop() {
                return new Promise((resolve) => {
                    var query = self.createSelectorQuery()
                    query.select('#product-container').boundingClientRect()
                    query.exec(function (rect) {
                        if (rect && rect[0]) {
                            resolve(rect[0].top);
                        }
                    });
                });
            }
        },
        onLoadMore(e) {
            if (this.data.page <= this.data.totalPage) {
                this.loadProduct();
            }
        },
        onChangeTab(e) {
            var id = e.currentTarget.dataset.id;
            var index = e.currentTarget.dataset.index;
            if (id != this.data.categoryId) {
                this.setData({
                    categoryId: id
                });
                this.loadProduct(true);
                this.setData({
                    scrollCategoryId: index ? this.data.categoryList[index - 1].id : 0
                });
            }
        },
        onclickProdcut(e) {
            var id = e.currentTarget.dataset.id;
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/product-detail/index?id=' + id
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
            var type = e.currentTarget.dataset.type;
            wx.jyApp.utils.navigateTo({
                url: `/pages/mall/product-list/index?type=${type}`
            });
        },
        loadProduct(refresh) {
            var page = refresh ? 1 : this.data.page;
            this.request = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.size,
                    categoryId: this.data.categoryId || '',
                    side: 'USER'
                }
            });
            this.request.then((data) => {
                data.page.list.map((item) => {
                    item._goodsName = item.goodsName;
                    item._unit = wx.jyApp.constData.unitChange[item.useUnit];
                    if (item.type != 1) {
                        item._unit = '份';
                    }
                    item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                });
                this.setData({
                    page: page + 1,
                    productList: refresh ? data.page.list : this.data.productList.concat(data.page.list),
                    totalPage: data.page.totalPage
                });
            });
            return this.request;
        },
        loadBaner() {
            return wx.jyApp.http({
                url: '/banner/list',
                data: {
                    bannerCode: '0001'
                }
            }).then((data) => {
                this.setData({
                    banner: data.list
                });
            });
        },
        loadCategoryList() {
            return wx.jyApp.http({
                url: '/goods/category'
            }).then((data) => {
                var categories = data.categories || [];
                this.setData({
                    categoryList: categories
                });
            });
        }
    }
})