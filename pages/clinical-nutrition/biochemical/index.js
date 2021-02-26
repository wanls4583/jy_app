/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
 * @Description: 
 */
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    properties: {
        patient: {
            type: Object,
            value: {}
        },
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                if (newVal) {
                    wx.nextTick(() => {
                        this.loadList();
                    });
                }
            }
        }
    },
    data: {
        activeNames: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1,
        lisList: []
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function () {
        this._attached();
    },
    methods: {
        _attached() {},
        onCollapseChange(event) {
            var activeNames = event.detail;
            if (activeNames.length) {
                activeNames = [activeNames[activeNames.length - 1]];
            }
            this.setData({
                activeNames: activeNames,
            });
        },
        onRefresh() {
            this.loadList(true);
        },
        onLoadMore() {
            this.loadList();
        },
        loadList(refresh) {
            if (refresh) {
                this.request && this.request.requestTask.abort();
            } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
                return;
            }
            this.loading = true;
            this.request = wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'lisResult',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient,
                    pageNum: refresh ? 1 : this.data.page,
                    pageSize: 20
                }
            })
            this.request.then((data) => {
                data = data.result;
                if (refresh) {
                    this.setData({
                        page: 1,
                        totalPage: -1,
                        lisList: []
                    });
                }
                this.setData({
                    page: this.data.page + 1,
                    totalPage: data.totalPage,
                    lisList: this.data.lisList.concat(data.rows),
                });
            }).finally(() => {
                this.setData({
                    stopRefresh: true
                });
                this.request = null;
                this.loading = false;
            });
        },
    }
})