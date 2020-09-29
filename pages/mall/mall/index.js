Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        banner: [],
        productList: [],
        taocanList: [],
        stopRefresh: false,
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
            this.loadProduct();
            this.loadBaner();
            this.setData({
                minContentHeight: wx.getSystemInfoSync().windowHeight - 80 - 54
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
            wx.jyApp.Promise.all([
                this.loadProduct(),
                this.loadBaner(),
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                });
            });
        },
        onclickProdcut(e) {
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
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
            wx.navigateTo({
                url: `/pages/mall/product-list/index?type=${type}`
            });
        },
        loadProduct() {
            var rq1 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: 1,
                    limit: 6,
                    type: 2,
                    side: 'USER'
                }
            }).then((data) => {
                data.page.list.map((item) => {
                    item._goodsName = item.goodsName;
                    item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                });
                this.setData({
                    taocanList: data.page.list
                });
            });
            var rq2 = wx.jyApp.http({
                url: '/goods/list',
                data: {
                    page: 1,
                    limit: 6,
                    type: 1,
                    side: 'USER'
                }
            }).then((data) => {
                data.page.list.map((item) => {
                    item._goodsName = item.goodsName;
                    item._useUnit = wx.jyApp.constData.unitChange[item.useUnit];
                    item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                });
                this.setData({
                    productList: data.page.list
                });
            });
            return Promise.all([rq1, rq2]);
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
    }
})