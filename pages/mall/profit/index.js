/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        orderList: [],
        page: 1,
        limit: 10,
        totalPage: -1,
        total: 0,
        stopRefresh: false,
        startDate: new Date().getTime(),
        _startDate: '',
        endDate: 0,
        _endDate: '',
        startDateVisible: false,
        endDateVisible: false,
        statusMap: {
            1: '待到账',
            2: '已到账',
            '-1': '已取消',
        }
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadList();
        this.loadSummary();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onShowDate(e) {
        this.setData({
            [`startDateVisible`]: true
        });
    },
    onConfirmStartDate(e) {
        this.setData({
            [`startDateVisible`]: false,
            [`endDateVisible`]: true,
            [`startDate`]: e.detail,
            [`endDate`]: 0,
            [`_startDate`]: new Date(e.detail).formatTime('yyyy-MM-dd'),
        })
    },
    onCancelStart(e) {
        this.setData({
            [`_startDate`]: '',
            [`startDateVisible`]: false,
            [`endDateVisible`]: true,
        })
    },
    onConfirmEndDate(e) {
        this.setData({
            [`endDate`]: e.detail,
            [`_endDate`]: new Date(e.detail).formatTime('yyyy-MM-dd'),
            [`endDateVisible`]: false
        });
        this.loadList(true);
    },
    onCancelEnd(e) {
        this.setData({
            [`_endDate`]: '',
            [`endDateVisible`]: false
        })
        this.loadList(true);
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList(false);
    },
    loadSummary() {
        wx.jyApp.http({
            url: '/userincome/summary',
        }).then((data) => {
            this.setData({
                summary: data.summary
            });
        })
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.data.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.data.loading = true;
        this.request = wx.jyApp.http({
            url: '/userincome/list',
            data: {
                startDate: this.data._startDate,
                endDate: this.data._endDate,
                page: refresh ? 1 : this.data.page,
                limit: this.data.limit
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    orderList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                });
            }
            data.page.list.map((item) => {
                item._status = this.data.statusMap[item.status];
                item.goods && item.goods.map((_item) => {
                    _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                    _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
                });
            });
            this.setData({
                'page': this.data.page + 1,
                'total': data.total,
                'totalPage': data.page.totalPage,
                'orderList': this.data.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.request = null;
            this.data.loading = false;
            this.setData({
                'stopRefresh': true
            });
        });
        return this.request;
    }
})