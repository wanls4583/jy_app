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
        if (this.data.userInfo.viewVersion == 2 || this.data.doctorInfo && this.data.doctorInfo.hosDepartment) {
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
        var url = this.viewVersion == 2 ? '/hospital/department/user' : '/wx/user/doctor';
        this.loading = true;
        this.request = wx.jyApp.http({
            url: url,
        });
        this.request.then((data) => {
            if (this.viewVersion == 2) {
                var list = [];
                data.list.map((item) => {
                    var arr = item.doctors || [];
                    if (!this.departmentId || item.id == this.departmentId) {
                        arr.map((_item) => {
                            _item.departmentName = item.departmentName;
                            _item.hospitalName = item.hospitalName;
                        });
                        list = list.concat(item.doctors || []);
                    }
                });
                this.setData({
                    'doctorList': list
                });
            } else {
                this.setData({
                    'doctorList': data.list || []
                });
            }
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