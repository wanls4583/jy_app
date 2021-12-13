Page({
    data: {
        departmentName: '',
        hospitalName: '',
        status: 1,
        _status: '上线',
        statusList: [{
            label: '上线',
            value: 1
        }, {
            label: '下线',
            value: 0
        }],
        statusMap: {
            1: '上线',
            0: '下线',
        },
        statusDefault: 0,
        statusVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
            actions: ['updateDoctorInfo', 'updatePharmacistInfo'],
        });
        this.storeBindings.updateStoreBindings();
        if (this.data.doctorInfo && this.data.doctorInfo.hosDepartment) {
            var hosDepartment = this.data.doctorInfo.hosDepartment;
            this.setData({
                id: hosDepartment.departmentId,
                departmentName: hosDepartment.departmentName,
                hospitalName: hosDepartment.hospitalName,
                status: hosDepartment.status,
                _status: this.data.statusMap[hosDepartment.status],
                statusDefault: hosDepartment.status == 1 ? 0 : 1
            });
            wx.setNavigationBarTitle({
                title: '修改资料'
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onShowStatus() {
        this.setData({
            statusVisible: !this.data.statusVisible
        });
    },
    onConfirmStatus(e) {
        this.setData({
            statusVisible: false,
            _status: this.data.statusMap[e.detail.value.value],
            status: e.detail.value.value
        });
    },
    onCancel() {
        this.setData({
            statusVisible: false
        });
    },
    onSave() {
        if (!this.data.hospitalName) {
            wx.jyApp.toast('请输入医院名称');
            return;
        }
        if (!this.data.departmentName) {
            wx.jyApp.toast('请输入科室名称');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/hospital/department/saveOrUpdate`,
            method: 'post',
            data: {
                departmentName: this.data.departmentName,
                hospitalName: this.data.hospitalName,
                status: this.data.status,
                id: this.data.id,
            }
        }).then((data) => {
            // 更新医生科室信息
            this.getDoctorInfo().then(()=>{
                wx.hideLoading();
                wx.jyApp.toastBack('保存成功');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    getDoctorInfo() {
        return wx.jyApp.loginUtil.getDoctorInfo(this.data.doctorInfo.id).then((data) => {
            this.updateDoctorInfo(Object.assign({}, data.doctor));
        });
    },
})