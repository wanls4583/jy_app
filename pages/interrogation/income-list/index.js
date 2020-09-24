Page({
    data: {
        dataList: [],
        summary: {},
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        statusMap: {
            1: '待到账',
            2: '已到账'
        },
        dateVisible: false,
        date: ''
    },
    onLoad() {
        this.setData({
            _date: new Date().formatTime('yyyy年MM月'),
            date: Date.now()
        });
        this.yearMonth = new Date().formatTime('yyyy-MM');
        this.loadList();
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onShowDate() {
        this.setData({
            dateVisible: true
        })
    },
    onConfirmDate(e) {
        var _date = new Date(e.detail).formatTime('yyyy年MM月');
        this.setData({
            _date: _date,
            dateVisible: false
        });
        this.yearMonth = new Date(e.detail).formatTime('yyyy-MM');
        this.loadList(true);
    },
    onCancel() {
        this.setData({
            dateVisible: false
        });
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctorincome/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20,
                yearMonth: this.yearMonth || ''
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    dataList: []
                });
            }
            data.page.list.map((item) => {
                item._type = '问诊服务';
                item._status = this.data.statusMap[item.status];
            });
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                dataList: this.data.dataList.concat(data.page.list),
                summary: data.summary
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.loading = false;
            this.request = null;
        });
    }
})