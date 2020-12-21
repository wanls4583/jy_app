/*
 * @Author: lisong
 * @Date: 2020-09-07 14:39:31
 * @Description: 
 */
Page({
    data: {
        list: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        totalCount: 0
    },
    onLoad(option) {
        this.doctorId = option.id;
        this.loadList(true);
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctorappraise/list',
            data: {
                doctorId: this.doctorId,
                page: refresh ? 1 : this.data.page,
                limit: 20
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
            data.page.list.map((item) => {
                if (item.type == 1) {
                    item._type = '图文问诊';
                } else if(item.type == 3) {
                    item._type = '视频问诊';
                }
            });
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                totalCount: data.page.totalCount,
                list: this.data.list.concat(data.page.list)
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