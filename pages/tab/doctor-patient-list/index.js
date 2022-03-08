Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        patientList: [],
        stopRefresh: false,
        totalPage: -1,
        totalCount: 0,
        page: 1,
        active: 0,
        menuRect: wx.jyApp.utils.getMenuRect(),
        departmentPatient: {}
    },
    lifetimes: {
        attached(option) {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['doctorInfo', 'userInfo'],
            });
            this.storeBindings.updateStoreBindings();
            this.setData({
                hosDepartment: this.data.doctorInfo && this.data.doctorInfo.hosDepartment
            });
            this.loadList(true);
            if (this.data.hosDepartment) {
                this.loadDepartmentPatientList();
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onShow() {
            if (this.loaded) {
                this.showTimer = setTimeout(() => {
                    if (this.data.hosDepartment && this.data.active == 0) {
                        this.loadDepartmentPatientList();
                    } else {
                        this.loadList(true);
                    }
                }, 500);
            }
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
        onRefresh() {
            this.loadList(true);
        },
        onLoadMore() {
            this.loadList();
        },
        onDepartmentPatientRefresh() {
            this.loadDepartmentPatientList();
        },
        onClickPatient(e) {
            var roomId = e.currentTarget.dataset.roomid;
            if (!wx.jyApp.utils.checkDoctor({
                    checkStatus: true
                })) {
                return;
            }
            if (roomId && roomId.slice(0, 2) == 'g-') {
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/chat-v2/index?roomId=' + roomId
                });
            } else {
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/chat/index?roomId=' + roomId
                });
            }
        },
        onClickPhone() {
            wx.makePhoneCall({
                phoneNumber: wx.jyApp.store.configData.service_phone
            });
        },
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onCheckGoto(e) {
            if (wx.jyApp.utils.checkDoctor()) {
                this.onGoto(e);
            }
        },
        onGotoSearch() {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/doctor-patient-search/index'
            });
        },
        onChangeInStatus(e) {
            var item = e.currentTarget.dataset.item;
            item.inHospitalStatus = item.inHospitalStatus == 1 ? 0 : 1;
            this.updateStatus(item);
        },
        onChangeConsultFlag(e) {
            var item = e.currentTarget.dataset.item;
            item.consultFlag = item.consultFlag === 1 ? 0 : 1;
            this.updateStatus(item);
        },
        //加载患者列表
        loadDepartmentPatientList() {
            if (this.data.departmentPatient.loading) {
                return;
            }
            this.data.departmentPatient.loading = true;
            this.data.departmentPatient.request = wx.jyApp.http({
                url: '/hospital/department/patient',
                data: {
                    departmentId: this.data.doctorInfo.hosDepartment.departmentId
                }
            });
            this.data.departmentPatient.request.then((data) => {
                this.setData({
                    'departmentPatient.list': data.list || []
                });
            }).finally(() => {
                this.data.departmentPatient.loading = false;
                this.data.departmentPatient.request = null;
                this.setData({
                    'departmentPatient.stopRefresh': true
                });
            });
            return this.data.departmentPatient.request;
        },
        loadList(refresh) {
            if (!this.data.doctorInfo || this.data.doctorInfo.role == 'DOCTOR' && this.data.doctorInfo.authStatus == 0 || this.data.doctorInfo.status == 3) { //医生状态异常
                this.setData({
                    stopRefresh: true,
                    page: 1,
                    totalPage: -1,
                    patientList: []
                });
                return;
            }
            if (refresh) {
                this.request && this.request.requestTask.abort();
            } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
                return;
            }
            this.loading = true;
            this.request = wx.jyApp.http({
                url: '/doctor/patients',
                data: {
                    page: refresh ? 1 : this.data.page,
                    limit: 20,
                    patientName: this.patientName || ''
                }
            });
            this.request.then((data) => {
                if (refresh) {
                    this.setData({
                        page: 1,
                        totalPage: -1,
                        patientList: []
                    });
                }
                data.page.list = data.page.list || [];
                data.page.list.map((item) => {
                    item._sex = item.sex == 1 ? '男' : '女';
                    item.BMI = (item.weight) / (item.height * item.height / 10000);
                    item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                });
                this.data.patientList = this.data.patientList.concat(data.page.list);
                this.setData({
                    patientList: this.data.patientList,
                    page: this.data.page + 1,
                    totalPage: data.page.totalPage,
                    totalCount: data.page.totalCount
                });
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                this.loading = false;
                this.loaded = true;
                this.request = null;
                this.setData({
                    stopRefresh: true
                });
            });
        },
        updateStatus(item) {
            if (this.updateStatus.doing) {
                return;
            }
            this.updateStatus.doing = true;
            wx.jyApp.showLoading('修改中...');
            wx.jyApp.http({
                url: '/hospital/department/patient/update',
                method: 'post',
                data: {
                    departmentId: item.departmentId,
                    patientId: item.patientId,
                    inHospitalStatus: item.inHospitalStatus,
                    consultFlag: item.consultFlag
                }
            }).then(() => {
                wx.jyApp.toast('修改成功');
                this.data.departmentPatient.list.map((_item, index) => {
                    if (_item.patientId == item.patientId) {
                        _item.inHospitalStatus = item.inHospitalStatus;
                        _item.consultFlag = item.consultFlag;
                        this.setData({
                            [`departmentPatient.list[${index}]`]: _item
                        });
                    }
                });
            }).finally(() => {
                wx.hideLoading();
                this.updateStatus.doing = false;
            });
        }
    }
})