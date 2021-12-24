Page({
    data: {
        deparmentList: []
    },
    onLoad(option) {
        this.loadList();
    },
    onRefresh() {
        this.loadList();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //加载医生列表
    loadList() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/hospital/department/user/department'
        });
        this.request.then((data) => {
            this.setData({
                'deparmentList': data.list || []
            });
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    }
})