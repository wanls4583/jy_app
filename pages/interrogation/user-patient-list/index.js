Page({
    data: {
        patientList: [],
        selectId: 0,
        ifSelect: false
    },
    onLoad(option) {
        // 患者端v2版本选择默认患者
        this.joinDoctorId = option.joinDoctorId || '';
        this.joinDoctorWay = option.joinDoctorWay || '';
        this.screen = option.screen || '';
        this.setDefault = option.setDefault || '';
        this.doctorId = option.doctorId || '';
        this.doctorName = option.doctorName || '';
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'userInfo']
        });
        this.storeBindings.updateStoreBindings();
        // v2版本分享筛查结果
        this.share = this.data.userInfo.viewVersion == 2 ? 1 : '';
        this.setData({
            ifSelect: option.select || this.setDefault || this.joinDoctorId || false,
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
        if (this.setDefault || this.joinDoctorId) {
            this.data.patient.defaultFlag = 1;
            this.data.patient.doctorId = this.joinDoctorId;
            wx.jyApp.http({
                url: `/patientdocument/update`,
                method: 'post',
                data: this.data.patient
            }).then(() => {
                if (this.joinDoctorWay != 'private' && this.joinDoctorId) { //私域医生跳首页，加入科室跳筛查
                    this.screen = this.screen || 'mpgsga';
                }
                // 更新当前用户信息
                wx.jyApp.loginUtil.getUserInfo();
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
            wx.jyApp.utils.redirectTo({
                url: `/pages/screen/${this.screen}/index?doctorId=${this.doctorId}&&doctorName=${this.doctorName}&from=screen&share=${this.share}`
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
            url: `/pages/interrogation/user-patient-edit/index`
        });
    },
    // selectId参数是user-patient-edit页面调用时传递的参数
    loadList(selectId) {
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
            var patient = null;
            selectId = selectId || this.data.selectId;
            data.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                // v2版本加入科室时选择患者，默认选中默认患者
                if (item.defaultFlag == 1 && !selectId) {
                    selectId = item.id;
                }
                if (item.id == selectId) {
                    patient = item;
                }
            });
            if (!selectId && data.list) {
                selectId = data.list[0].id;
                patient = data.list[0];
            }
            this.setData({
                patientList: data.list || [],
                selectId: selectId,
                patient: patient
            });


        }).finally(() => {
            wx.hideLoading();
        });
    }
})