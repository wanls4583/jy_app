/*
 * @Author: lisong
 * @Date: 2021-01-12 15:05:51
 * @Description: 
 */
Page({
    data: {
        list: [],
        page: 1,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData']
        });
        this.storeBindings.updateStoreBindings();
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onEdit(e) {
        var item = e.currentTarget.dataset.item;
        var url = '';
        switch (item.filtrateType) {
            case 'NRS2000':
                url = '/pages/screen/nrs/index';
                break;
            case 'PGSGA':
                url = '/pages/screen/pgsga/index';
                break;
            case 'SGA':
                url = '/pages/screen/sga/index';
                break;
            case 'MUST':
                url = '/pages/screen/must/index';
                break;
            case 'MNA':
                url = '/pages/screen/mna/index';
                break;
        }
        wx.jyApp.utils.navigateTo({
            url: `${url}?id=${item.id}`
        });
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/patient/filtrate/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20,
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    list: []
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(2) || '';
            });
            this.data.list = this.data.list.concat(data.page.list);
            this.setData({
                list: this.data.list,
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
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
})