/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        orderList: [],
        page: 1,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad(option) {
        this.loadList();
    },
    onUnload() {},
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList()
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/nutritionorder/approve/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20,
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    list: []
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item.patient._sex = item.patient.sex == 1 ? '男' : '女';
                item.patient.BMI = (item.patient.weight) / (item.patient.height * item.patient.height / 10000);
                item.patient.BMI = item.patient.BMI && item.patient.BMI.toFixed(2) || '';
            });
            this.data.orderList = this.data.orderList.concat(data.page.list);
            this.setData({
                list: this.data.orderList,
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
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
    onSave() {}
})