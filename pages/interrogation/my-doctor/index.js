Page({
    data: {
        doctorList: []
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.departmentId = option.departmentId; //患者聊天室科室医生列表
        if (this.data.userInfo.viewVersion == 2) {
            this.viewVersion = 2
        }
        this.setData({
            viewVersion: this.viewVersion
        });
        this.loadList();
        if (option.title) {
            wx.setNavigationBarTitle({
                title: option.title
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
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
        var url = this.viewVersion == 2 ? '/hospital/department/user/doctor' : '/wx/user/doctor';
        if (this.departmentId) { //科室医生
            url = '/hospital/department/doctor';
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: url,
            data: {
                departmentId: this.departmentId
            }
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