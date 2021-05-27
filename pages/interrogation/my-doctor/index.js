Page({
    data: {
        doctorList: []
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
            url: '/wx/user/doctor'
        });
        this.request.then((data) => {
            this.setData({
                'doctorList': data.list || []
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