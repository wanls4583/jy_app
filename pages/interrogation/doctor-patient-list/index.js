Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        patientList: [],
        stopRefresh: false,
        totalPage: -1,
        totalCount: 0,
        page: 1
    },
    lifetimes: {
        attached(option) {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['doctorInfo'],
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
            this.checkList();
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
            var id = e.currentTarget.dataset.id;
        },
        onClickPhone() {
            wx.makePhoneCall({
                phoneNumber: wx.jyApp.configData.phone
            });
        },
        onGoto(e) {
            wx.jyApp.navigateTo(e);
        },
        onGotoSearch() {
            if (this.data.totalPage <= 0) {
                return;
            }
            wx.navigateTo({
                url: '/pages/interrogation/doctor-patient-search/index'
            });
        },
        loadList(refresh) {
            if (!this.data.doctorInfo || this.data.doctorInfo.status == 3) { //医生状态异常
                this.setData({
                    stopRefresh: true,
                    page: 1,
                    totalPage: -1,
                    patientList: []
                });
                return;
            }
            this.setData({
                doctorDisabled: false
            });
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: 0,
                    patientList: []
                });
                this.request && this.request.requestTask.abort();
            } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
                return;
            }
            this.loading = true;
            this.request = wx.jyApp.http({
                url: '/doctor/patients',
                data: {
                    page: this.data.page,
                    limit: 20,
                    patientName: this.patientName || ''
                }
            });
            this.request.then((data) => {
                data.page.list.map((item) => {
                    item._sex = item.sex == 1 ? '男' : '女';
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