Component({
    options: {
        styleIsolation: 'shared'
    },
    data: {
        patientList: [],
        stopRefresh: false,
        totalPage: -1,
        page: 1
    },
    lifetimes: {
        attached(option) {
            this.loadList();
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
        onGotoSearch() {
            wx.navigateTo({
                url: '/pages/interrogation/doctor-patient-search/index'
            });
        },
        loadList(refresh) {
            if (this.loading || !refresh && this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
                return;
            }
            this.loading = true;
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    patientList: []
                });
            }
            wx.jyApp.http({
                url: '/doctor/patients'
            }).then((data) => {
                this.loading = false;
                this.data.patientList = this.data.patientList.concat(data.page.list);
                this.setData({
                    patientList: this.data.patientList,
                    page: this.data.page + 1,
                    totalPage: data.page.totalPage
                });
                if (refresh) {
                    this.setData({
                        stopRefresh: true
                    });
                }
            }).catch(() => {
                this.loading = false;
            });
        }
    }
})