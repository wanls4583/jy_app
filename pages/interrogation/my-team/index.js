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
        this.loadList();
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
    onGotoDoctor(e) {
        // 只有上级医生才能查看下级医生的订单列表和评估列表
        if (this.data.doctorInfo.hosDepartment.type == 2) {
            wx.jyApp.utils.navigateTo(e);
        }
    },
    onDelDoctor(e) {
        var item = e.currentTarget.dataset.item;
        if (item.id == this.data.doctorInfo.id) {
            wx.jyApp.toast('不能删除自己');
            return;
        }
        if (item.type == 2) {
            wx.jyApp.toast('不能删除上级医生');
            return;
        }
        wx.jyApp.dialog.confirm({
            message: '确定删除医生？'
        }).then(() => {
            wx.jyApp.http({
                url: '/hospital/department/doctor/delete',
                data: {
                    doctorId: item.id
                }
            }).then(() => {
                wx.jyApp.toast('删除成功');
                this.loadList();
            });
        });
    },
    //加载医生列表
    loadList() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/hospital/department/doctor',
            data: {
                departmentId: this.data.doctorInfo.hosDepartment.departmentId
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