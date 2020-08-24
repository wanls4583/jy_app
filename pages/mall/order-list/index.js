import { orderStatusMap } from '../../../utils/data';

Page({
    data: {
        orderList: [],
        page: 1,
        limit: 10,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad() {
        this.loadList();
    },
    onRefresh() {
        this.loadList(true).then(() => {
            this.setData({
                stopRefresh: true
            });
        });
    },
    onLoadMore() {
        this.loadList();
    },
    onClickOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/order-detail/index?id=' + id
        });
    },
    loadList(refresh) {
        if (this.loading || !refresh && this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        if (refresh) {
            this.setData({
                page: 1,
                totalPage: -1,
                orderList:  []
            });
        }
        return wx.jyApp.http({
            url: '/order/list',
            page: this.data.page,
            limit: this.data.limit
        }).then((data) => {
            this.loading = false;
            data.page.list.map((item) => {
                item._status = orderStatusMap[item.status];
            });
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                orderList: this.data.orderList.concat(data.page.list)
            });
        })
    }
})