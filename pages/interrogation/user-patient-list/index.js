Page({
    data: {
        patientList: [],
        selectId: 0,
        ifSelect: false
    },
    onLoad(option) {
        // 患者端v2版本选择默认患者
        this.joinDoctorId = option.joinDoctorId || '';
        this.screen = option.screen || '';
        this.doctorId = option.doctorId || '';
        this.doctorName = option.doctorName || '';
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'userInfo']
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            ifSelect: option.select || this.joinDoctorId || false,
            screen: this.screen
        });
        if (this.data.ifSelect) {
            this.setData({
                btnText: '下一页'
            });
        }
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    onSave() {
        if (!this.data.selectId) {
            wx.jyApp.toast('请选择患者');
            return;
        }
        // 客户端v2版本设置默认患者
        if (this.data.userInfo.viewVersion == 2 || this.joinDoctorId) {
            this.data.patient.defaultFlag = 1;
            this.data.patient.doctorId = this.joinDoctorId;
            wx.jyApp.http({
                url: `/patientdocument/update`,
                method: 'post',
                data: this.data.patient
            }).then(() => {
                // 跳转到筛查页面
                if (this.screen) {
                    _toScreen.call(this);
                    return;
                } else {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    });
                }
            });
            return;
        }
        // 跳转到筛查页面
        if (this.screen) {
            _toScreen.call(this);
            return;
        }
        var bookDateTime = wx.jyApp.tempData.illness.bookDateTime;
        wx.jyApp.http({
            url: '/consultorder/book/check',
            data: {
                patientId: this.data.selectId,
                doctorId: wx.jyApp.tempData.illness.doctorId,
                type: wx.jyApp.tempData.illness.type,
                bookDateTime: bookDateTime && bookDateTime.formatTime('yyyy-MM-dd hh:mm') || ''
            }
        }).then(() => {
            wx.jyApp.tempData.illness.patientId = this.data.selectId;
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/interrogation-pay/index'
            });
        });

        function _toScreen() {
            // 跳转到筛查页面
            if (this.screen == 'fat' || this.screen == 'fat-assess') {
                if (!(this.data.patient.age >= 6 && this.data.patient.age <= 18)) {
                    wx.jyApp.toast('该项筛查/评估适用年龄为6-18岁');
                    return;
                }
            }
            wx.jyApp.setTempData('screenPatient', this.data.patient);
            wx.redirectTo({
                url: `/pages/screen/${this.screen}/index?doctorId=${this.doctorId}&&doctorName=${this.doctorName}&from=screen`
            });
        }
    },
    onChange(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            selectId: item.id,
            patient: item
        });
    },
    onDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/record/index?patientId=' + id
        });
    },
    onEdit(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/user-patient-edit/index?id=' + id
        });
    },
    onDelete(e) {
        wx.jyApp.dialog.confirm({
            message: '确定删除么？',
            confirmButtonText: '删除'
        }).then(() => {
            var id = e.currentTarget.dataset.id;
            wx.jyApp.showLoading('删除中...', true);
            wx.jyApp.http({
                url: '/patientdocument/delete',
                method: 'post',
                data: {
                    id: id
                }
            }).then(() => {
                wx.hideLoading();
                wx.jyApp.toast('删除成功');
                this.loadList();
            }).catch(() => {
                wx.hideLoading();
            });
        });
    },
    onAdd(e) {
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/user-patient-edit/index?screen=${this.screen}&doctorId=${this.doctorId}&doctorName=${this.doctorName}&joinDoctorId=${this.joinDoctorId}`
        });
    },
    loadList() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        return wx.jyApp.http({
            url: '/patientdocument/list',
            data: {
                page: 1,
                limit: 1000
            }
        }).then((data) => {
            var selected = 0;
            data.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                // v2版本加入科室时选择患者，默认选中默认患者
                if (item.defaultFlag == 1) {
                    selected = item.id;
                }
            });
            this.setData({
                patientList: data.list || [],
                selectId: this.data.selectId || selected || (data.list.length ? data.list[0].id : 0),
                patient: this.data.patient || (data.list.length ? data.list[0] : null)
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})