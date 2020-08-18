import http from '../../utils/request';
const app = getApp()

Page({
    data: {
        searchText: '',
        active: 0,
        stopRefresh: false,
        taocanData: {
            pageList: {},
            page: 1,
            nowPage: 1
        },
        productData: {
            pageList: {},
            page: 1,
            nowPage: 1
        },
        limit: 3 * 3 * 5,
        pageArr: []
    },
    onLoad() {
        var tmp = [];
        for (var i = 1; i <= 500; i++) {
            tmp.push(i);
        }
        this.setData({
            pageArr: tmp,
        });
        this.loadList();
    },
    onSearch() {

    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail.value
        });
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onRefresh() {

    },
    onLoadMore() {

    },
    loadList() {
        if (this.data.active == 0) {
            var page = this.data.taocanData.page;
            http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 1
                }
            }).then((data) => {
                data.page.list.map((item) => {
                    item.goodsPic = item.goodsPic.split(',')[0];
                });
                this.setData({
                    [`taocanData.pageList[${page}]`]: data.page.list || [],
                    [`taocanData.page`]: page + 1
                });
            });
        } else {
            var page = this.data.productData.page;
            http({
                url: '/goods/list',
                data: {
                    page: page,
                    limit: this.data.limit,
                    type: 1
                }
            }).then((data) => {
                this.setData({
                    [`productData.pageList[${page}]`]: data.page.list || [],
                    [`productData.page`]: page + 1
                });
            });
        }
    }
})