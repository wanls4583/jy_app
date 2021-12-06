/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
 * @Description: 
 */
Page({
    data: {
        patientId: '',
        confirmPatientId: '',
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
    onSearch() {
        this.setData({
            confirmPatientId: this.data.patientId
        });
        this.getPatientList(true);
    },
    //退出
    onExit() {
        wx.removeStorageSync('mobileToken');
        wx.jyApp.utils.redirectTo({
            url: '/pages/clinical-nutrition/login/index'
        });
    },
    onRefresh() {
        this.getPatientList(true);
    },
    onLoadMore() {
        this.getPatientList();
    },
    getPatientList(refresh) {
        if(!this.data.confirmPatientId) {
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
                patientId: this.data.confirmPatientId,
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