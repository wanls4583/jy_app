/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
 * @Description: 
 */
Page({
    data: {
        patientId: '',
        patientList: [],
        page: 1,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad() {
        this.getPatientList();
    },
    onGotoSearch() {
        wx.jyApp.utils.onInput(e, this);
        this.onRefresh();
    },
    onRefresh() {
        this.getPatientList(true);
    },
    onLoadMore() {
        this.getPatientList();
    },
    getPatientList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            type: 'mobile',
            url: '/app/nutrition/query',
            data: {
                method: 'patient',
                patientId: this.data.patientId,
                page: refresh ? 1 : this.data.page,
                limit: 20
            }
        })
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    patientList: []
                });
            }
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                patientList: this.data.patientList.concat(data.page.list)
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.request = null;
            this.loading = false;
        });
    },
})