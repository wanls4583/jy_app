Page({
    data: {
        searchText: '',
        searchTipVisible: false,
        stopRefresh: false,
        doctorList: [],
        recentList: [],
        page: 1,
        limit: 20,
        totalPage: -1,
        firstLoad: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadRecent();
        this.doctorIds = [];
        this.consultOrderId = option.consultOrderId;
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {

    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail
        });
    },
    onCancel() {
        this.setData({
            searchTipVisible: false
        });
    },
    onFocus() {
        this.setData({
            searchTipVisible: true
        });
    },
    onSearch() {
        this.setData({
            searchTipVisible: false,
            firstLoad: false
        });
        this.complexName = this.data.searchText;
        this.loadList(true);
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onGoto(e) {
        // wx.jyApp.utils.navigateTo(e);
    },
    onCheckboxChange(e) {
        this.doctorIds = e.detail.value;
    },
    onSubmit() {
        wx.jyApp.dialog.confirm({
            message: '确定转诊该问诊单？'
        }).then(() => {
            wx.showLoading('转诊中...', true);
            wx.jyApp.http({
                url: '/consultorder/transfer',
                method: 'post',
                data: {
                    id: this.consultOrderId,
                    doctorIds: this.doctorIds.join(',')
                }
            }).then(() => {
                wx.jyApp.toastBack('转诊成功');
                var page = wx.jyApp.utils.getPageByLastIndex(2);
                if (page && page.route == 'pages/interrogation/chat/index') {
                    page.setData({
                        'consultOrder.status': 8,
                        inputHeight: 0
                    });
                }
            }).finally(() => {
                wx.hideLoading();
            });
        });
    },
    //加载医生列表
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: this.data.limit,
                complexName: this.complexName || '',
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    doctorList: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                });
            }
            var list = data.page.list || [];
            list = list.filter((item)=>{
                return item.id != this.data.doctorInfo.id;
            });
            this.setData({
                'page': this.data.page + 1,
                'totalPage': data.page.totalPage,
                'doctorList': this.data.doctorList.concat(list)
            });
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    },
    loadRecent() {
        wx.jyApp.http({
            url: '/doctor/recent/transfer/list',
        }).then((data) => {
            this.setData({
                recentList: data.list || [],
                firstLoad: data.list.length > 0
            });
            if (!this.data.firstLoad) {
                this.loadList();
            }
        });
    }
})