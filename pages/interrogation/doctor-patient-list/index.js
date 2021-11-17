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
        menuRect: wx.jyApp.utils.getMenuRect()
    },
    lifetimes: {
        attached(option) {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['doctorInfo', 'userInfo'],
            });
            this.storeBindings.updateStoreBindings();
            this.loadList(true);
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    pageLifetimes: {
        show() {
            if (this.loaded) {
                this.checkList();
            }
        }
    },
    methods: {
        onRefresh() {
            this.loadList(true);
        },
        onLoadMore() {
            this.loadList();
        },
        onClickPatient(e) {
            var roomId = e.currentTarget.dataset.roomid;
            if (!wx.jyApp.utils.checkDoctor({
                    checkStatus: true
                })) {
                return;
            }
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/chat/index?roomId=' + roomId
            });
        },
        onClickPhone() {
            wx.makePhoneCall({
                phoneNumber: wx.jyApp.store.configData.service_phone
            });
        },
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onCheckGotoWithFullCertification(e) {
            if (wx.jyApp.utils.checkDoctor({
                    checkFullAuthStatus: true
                })) {
                this.onGoto(e);
            }
        },
        onGotoSearch() {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/doctor-patient-search/index'
            });
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
        //检查是否有新患者
        checkList() {
            wx.jyApp.http({
                url: '/doctor/patients',
                data: {
                    page: 1,
                    limit: 1
                }
            }).then((data) => {
                if (data.page.totalCount != this.data.totalCount) {
                    this.loadList(true);
                }
            });
        }
    }
})