Page({
    data: {
        patientList: [],
        stopRefresh: false,
        totalPage: -1,
        totalCount: 0,
        page: 1,
        focus: true,
        searchText: ''
    },
    onLoad() {
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onClickPatient(e) {
        var id = e.currentTarget.dataset.id;
    },
    onSearch() {
        this.patientName = this.data.searchText;
        this.loadList(true);
    },
    loadList(refresh) {
        if (refresh) {
            this.setData({
                page: 1,
                totalPage: -1,
                patientList: []
            });
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctor/patients',
            data: {
                patientName: this.patientName || ''
            }
        });
        this.request.then((data) => {
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                // item.joinTime = new Date(item.joinTime);
            });
            this.data.patientList = this.data.patientList.concat(data.page.list);
            this.setData({
                patientList: this.data.patientList,
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                totalCount: data.page.totalCount
            });
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
    },
})