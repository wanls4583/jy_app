/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        orderList: [],
        page: 1,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad(option) {
        this.loadList();
    },
    onUnload() {},
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList()
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/nutritionorder/approve/list',
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
                item.orderTime = new Date(item.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
                switch (item.status) {
                    case 11:
                        item._status = '审核不通过';
                        item.statusColor = 'danger-color';
                        break;
                    case 10:
                        item._status = '待审核';
                        break;
                    case 0:
                        item._status = '审核通过';
                        item.statusColor = 'success-color';
                        break;
                }
            });
            this.data.orderList = this.data.orderList.concat(data.page.list);
            this.setData({
                orderList: this.data.orderList,
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
    onPass(e) {
        var item = e.currentTarget.dataset.item;
        var index = e.currentTarget.dataset.index;
        wx.jyApp.dialog.confirm({
            message: '确定通过审核？'
        }).then(() => {
            wx.jyApp.http({
                url: '/nutritionorder/approve/quick',
                method: 'post',
                data: {
                    id: item.id
                }
            }).then((data) => {
                item.status = 0;
                item._status = '审核通过';
                item.statusColor = 'success-color';
                this.setData({
                    [`orderList[${index}]`]: item
                });
                wx.jyApp.toast('操作成功');
            });
        });
    },
    onDetail(e) {
        if (this.holding) {
            return;
        }
        this.holding = true;
        var id = e.currentTarget.dataset.id;
        wx.jyApp.http({
            url: '/nutritionorder/info/' + id
        }).then((data) => {
            wx.jyApp.setTempData('guideOrderDetail', data.detail);
            data.detail.goods.map((item) => {
                item.totalAmount = item.price;
            });
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/medical-record/index?from=examine'
            });
        }).finally((err) => {
            this.holding = false;
        });
    }
})