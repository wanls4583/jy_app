Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        banner: [],
        productList: [],
        taocanList: [],
        stopRefresh: false
    },
    lifetimes: {
        attached() {
            this.loadProduct();
            this.loadBaner();
        }
    },
    methods: {
        onGotoSearch() {
            wx.navigateTo({
                url: '/pages/mall/search/index'
            });
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
                    type: 2
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
                    type: 1
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