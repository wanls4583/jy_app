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
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onGoto(e) {
        var item = e.currentTarget.dataset.item;
        wx.jyApp.setTempData('nutritionPatient', item);
        wx.jyApp.utils.navigateTo(e);
    },
    onRefresh() {
        this.getPatientList(true);
    },
    onLoadMore() {
        this.getPatientList();
    },
    getPatientList(refresh) {
        if(!this.data.patientId) {
            this.setData({
                stopRefresh: true
            });
            return;
        }
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
                pageNum: refresh ? 1 : this.data.page,
                pageSize: 20,
                isInpatient: true
            }
        })
        this.request.then((data) => {
            data = data.result;
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    patientList: []
                });
            }
            this.setData({
                page: this.data.page + 1,
                totalPage: data.totalPage,
                patientList: this.data.patientList.concat(data.rows)
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