Page({
    data: {
        statusList: [1, 5, 3],
        statusActiveMap: {
            1: 0,
            5: 1,
            3: 2
        },
        dataMap: {
            1: {
                patientList: [],
                stopRefresh: false,
                totalPage: -1,
                page: 1,
            },
            3: {
                patientList: [],
                stopRefresh: false,
                totalPage: -1,
                page: 1,
            },
            5: {
                patientList: [],
                stopRefresh: false,
                totalPage: -1,
                page: 1,
            }
        },
        active: 0
    },
    onLoad(options) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo', 'userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.status = options.status || 1;
        this.loading = {};
        this.request = {};
        this.loadList(true, 1);
        this.loadList(true, 3);
        this.loadList(true, 5);
        this.setData({
            active: this.data.statusActiveMap[this.status]
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onRefresh(e) {
        this.loadList(true, this.status);
    },
    onLoadMore(e) {
        this.loadList(false, this.status);
    },
    onChangeSwiper(e) {
        this.status = this.data.statusList[e.detail.current];
        this.setData({
            active: e.detail.current
        });
    },
    onChangeTab(e) {
        this.status = this.data.statusList[e.detail.index];
        this.setData({
            active: e.detail.index
        });
    },
    onClickPatient(e) {
        var roomId = e.currentTarget.dataset.roomid;
        if (!wx.jyApp.utils.checkDoctor({ checkStatus: true })) {
            return;
        }
        wx.navigateTo({
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
    loadList(refresh, status) {
        if (!this.data.doctorInfo || this.data.doctorInfo.authStatus != 1 || this.data.doctorInfo.status == 3) { //医生状态异常
            this.setData({
                [`dataMap[${status}].stopRefresh`]: true,
                [`dataMap[${status}].page`]: 1,
                [`dataMap[${status}].totalPage`]: -1,
                [`dataMap[${status}].patientList`]: []
            });
            return;
        }
        if (refresh) {
            this.request[status] && this.request[status].requestTask.abort();
        } else if (this.loading[status] || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading[status] = true;
        this.request[status] = wx.jyApp.http({
            url: '/consultorder/service/list',
            data: {
                page: refresh ? 1 : this.data.dataMap[status].page,
                limit: 20,
                status: status
            }
        });
        this.request[status].then((data) => {
            if (refresh) {
                this.setData({
                    [`dataMap[${status}].page`]: 1,
                    [`dataMap[${status}].totalPage`]: -1,
                    [`dataMap[${status}].patientList`]: []
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
            });
            this.data.dataMap[status].patientList = this.data.dataMap[status].patientList.concat(data.page.list);
            this.setData({
                [`dataMap[${status}].patientList`]: this.data.dataMap[status].patientList,
                [`dataMap[${status}].page`]: this.data.dataMap[status].page + 1,
                [`dataMap[${status}].totalPage`]: data.page.totalPage,
            });
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.loading[status] = false;
            this.request[status] = null;
            this.setData({
                [`dataMap[${status}].stopRefresh`]: true,
            });
        });
    }
})