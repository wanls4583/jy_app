Page({
    data: {
        searchText: '',
        goodsName: '',
        doctorData: {
            list: [{
                name: '医生1',
                zhiwei: '主任医师',
                hospital: '金沙洲医院',
                department: '营养科',
                shanchang: '对对对、顶顶顶顶',
                price: 30
            }],
            page: 1,
            limit: 3,
            totalPage: 1
        },
        taocanData: {
            list: [],
            page: 1,
            limit: 3,
            totalPage: -1
        },
        productData: {
            list: [],
            page: 1,
            limit: 3,
            totalPage: -1
        }
    },
    onLoad() {

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
            url: '/pages/product-detail/index?id=' + id
        });
    },
    search() {
        this.loadProduct(true);
        this.loadToacan(true);
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
                    limit: 3,
                    totalPage: -1
                }
            });
        }
        this.data.productData.loading = true;
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.productData.page,
                limit: this.data.productData.limit,
                type: 2,
                goodsName: this.data.goodsName
            },
            complete: () => {
                this.data.productData.loading = false;
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
            });
            this.setData({
                [`productData.list`]: this.data.productData.list.concat(data.page.list || []),
                [`productData.page`]: this.data.productData.page + 1,
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
                    limit: 3,
                    totalPage: -1
                }
            });
        }
        this.data.taocanData.loading = true;
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: this.data.taocanData.page,
                limit: this.data.taocanData.limit,
                type: 1,
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
                [`taocanData.list`]: this.data.taocanData.list.concat(data.page.list || []),
                [`taocanData.page`]: this.data.taocanData.page + 1,
                [`taocanData.totalPage`]: data.page.totalPage
            });
        });
    },
    loadDoctor(refresh) {

    }
})