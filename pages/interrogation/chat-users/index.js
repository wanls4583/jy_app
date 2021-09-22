Page({
    data: {
        patient: {
            list: [],
            page: 1,
            totalPage: -1,
            stopRefresh: false
        },
        doctor: {
            list: [],
            page: 1,
            totalPage: -1,
            stopRefresh: false
        },
        active: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadPatientList();
        this.loadDoctorList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onGotoDoctor(e) {
        var id = e.currentTarget.dataset.id;
        // 只有上级医生才能查看下级医生的订单列表和评估列表
        if (this.data.doctorInfo.hosDepartment.type == 2 || this.data.doctorInfo.id == id) {
            wx.jyApp.utils.navigateTo(e);
        }
    },
    onPatientRefresh() {
        this.loadPatientList();
    },
    onDoctorRefresh() {
        this.loadDoctorList();
    },
    //加载患者列表
    loadPatientList() {
        if (this.data.patient.loading) {
            return;
        }
        this.data.patient.loading = true;
        this.data.patient.request = wx.jyApp.http({
            url: '/hospital/department/patient',
            data: {
                departmentId: this.data.doctorInfo.hosDepartment.departmentId
            }
        });
        this.data.patient.request.then((data) => {
            this.setData({
                'patient.list': data.list || []
            });
        }).finally(() => {
            this.data.patient.loading = false;
            this.data.patient.request = null;
            this.setData({
                'patient.stopRefresh': true
            });
        });
        return this.data.patient.request;
    },
    //加载医生列表
    loadDoctorList() {
        if (this.data.doctor.loading) {
            return;
        }
        this.data.doctor.loading = true;
        this.data.doctor.request = wx.jyApp.http({
            url: '/hospital/department/doctor',
            data: {
                departmentId: this.data.doctorInfo.hosDepartment.departmentId
            }
        });
        this.data.doctor.request.then((data) => {
            this.setData({
                'doctor.list': data.list || []
            });
        }).finally(() => {
            this.data.doctor.loading = false;
            this.data.doctor.request = null;
            this.setData({
                'doctor.stopRefresh': true
            });
        });
        return this.data.doctor.request;
    }
})