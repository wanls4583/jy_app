Page({
    data: {
        list: [],
        stopRefresh: false
    },
    onLoad(option) {
        wx.jyApp.showLoading('加载中...', true);
        this.loadList().then(() => {
            wx.hideLoading();
        });
    },
    onShow() {
        if (this.firstLoaded) {
            this.loadList();
        }
        this.firstLoaded = true;
    },
    onRefresh() {
        this.loadList();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onDelMine(e) {
        wx.jyApp.dialog.confirm({
            message: '确认删除？'
        }).then(() => {
            var id = e.currentTarget.dataset.item.id;
            wx.jyApp.showLoading('删除中...');
            wx.jyApp.http({
                url: '/goodsdoctor/delete',
                method: 'delete',
                data: {
                    goodsId: id
                }
            }).then(() => {
                wx.jyApp.toast('删除成功');
                this.loadList();
            }).finally(() => {
                wx.hideLoading();
            });
        });
    },
    onGotoSearch() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/search/index?from=my-product'
        });
    },
    loadList() {
        if (this.loading) {
            this.request.abort();
        }
        this.request = wx.jyApp.http({
            url: '/goodsdoctor/list',
            complete: () => {
                this.loading = false;
            }
        })
        this.request.then((data) => {
            data.list.map((item) => {
                item.goodsPic = item.goodsPic.split(',')[0];
                if (item.type == 3) {
                    item._unit = '份';
                } else {
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                }
            });
            this.setData({
                list: data.list
            });
            wx.setStorageSync('my-product-ids', data.list.map((item) => {
                return item.id
            }));
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    }
})