Page({
    data: {
        stopRefresh: false,
        list: [],
        page: 1,
        limit: 20,
        totalPage: -1,
        area: '',
        category: '',
        years: '',
        searchVisible: false,
        categoryList: [
            '肿瘤', '糖尿病', '胃肠疾病', '肝胆疾病', '肾病', '母婴', '儿童', '老年人', '肥胖', '重症', 'ERAS', '其他'
        ],
        yearsList: [
            '2021', '2020', '2019', '2018', '2017', '2016', '2016以前'
        ],
        areaList: [
            '中国', '欧洲', '北美', '其他'
        ]
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {

    },
    //显示搜索
    onShowSearch() {
        if (this.data.searchVisible) {
            this.onCancelSearch();
            return;
        }
        this.originCategory = this.data.category;
        this.originYears = this.data.years;
        this.originArea = this.data.area;
        this.setData({
            searchVisible: true,
        });
    },
    onConfirmSearch() {
        this.setData({
            searchVisible: false
        });
        this.loadList(true);
    },
    onCancelSearch() {
        this.setData({
            category: this.originCategory || '',
            years: this.originYears || '',
            area: this.originArea || '',
            searchVisible: false
        });
    },
    //选中分类
    onClickCategory(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            category: this.data.category == item ? '' : item
        });
    },
    //选中年份
    onClickYears(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            years: this.data.years == item ? '' : item
        });
    },
    //选中地区
    onClickArea(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            area: this.data.area == item ? '' : item
        });
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    //加载列表
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/paper/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: this.data.limit,
                category: this.data.category,
                years: this.data.years,
                area: this.data.area,
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    list: [],
                    page: 1,
                    limit: 10,
                    totalPage: -1,
                    stopRefresh: false,
                });
            }
            this.setData({
                'page': this.data.page + 1,
                'totalPage': data.page.totalPage,
                'list': this.data.list.concat(data.page.list || [])
            });
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    }
})