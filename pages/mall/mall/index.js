Page({
    data: {
        banner: [],
        currentBannerIndex: 0,
        productList: [],
        taocanList: []
    },
    onLoad() {
        this.loadProduct();
        this.loadBaner();
    },
    bannerChang(e) {
        this.setData({
            currentBannerIndex: e.detail.current
        });
    },
    loadProduct() {
        wx.jyApp.http({
            url: '/emall/app/api/goods/list',
            data: {
                page: 1,
                limit: 6,
                type: 2
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item._goodsName = item.goodsName.length > 6 ? item.goodsName.slice(0, 6) + '...' : item.goodsName;
            });
            this.setData({
                taocanList: data.page.list
            });
        });
        wx.jyApp.http({
            url: '/emall/app/api/goods/list',
            data: {
                page: 1,
                limit: 6,
                type: 1
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item._goodsName = item.goodsName.length > 6 ? item.goodsName.slice(0, 6) + '...' : item.goodsName;
                item._useUnit = wx.jyApp.constData.unitChange[item.useUnit];
            });
            this.setData({
                productList: data.page.list
            });
        });
    },
    loadBaner() {
        wx.jyApp.http({
            url: '/emall/app/api/banner/list',
            data: {
                bannerCode: '0001'
            }
        }).then((data) => {
            this.setData({
                banner: data.list
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
    },
    //查看更多
    onClickMore(e) {
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/mall/product-list/index?type=${type}`
        });
    }
})