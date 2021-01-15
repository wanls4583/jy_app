/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        active: 0,
        statusList: [100, 10, 0, 11],
        orderListMap: {
            100: {
                orderList: [],
                page: 1,
                totalPage: -1,
                stopRefresh: false
            },
            10: {
                orderList: [],
                page: 1,
                totalPage: -1,
                stopRefresh: false
            },
            0: {
                orderList: [],
                page: 1,
                totalPage: -1,
                stopRefresh: false
            },
            11: {
                orderList: [],
                page: 1,
                totalPage: -1,
                stopRefresh: false
            }
        },

    },
    onLoad(option) {
        this.loadList(true, 100);
        this.loadList(true, 10);
        this.loadList(true, 0);
        this.loadList(true, 11);
    },
    onUnload() {},
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onRefresh(e) {
        var status = e.currentTarget.dataset.status;
        this.loadList(true, status);
    },
    onLoadMore(e) {
        var status = e.currentTarget.dataset.status;
        this.loadList(false, status)
    },
    loadList(refresh, status) {
        if (refresh) {
            this.data.orderListMap[status].request && this.data.orderListMap[status].request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.data.orderListMap[status].request = wx.jyApp.http({
            url: '/nutritionorder/approve/list',
            data: {
                page: refresh ? 1 : this.data.orderListMap[status].page,
                limit: 20,
                status: status == 100 ? '' : status
            }
        });
        this.data.orderListMap[status].request.then((data) => {
            if (refresh) {
                this.setData({
                    [`orderListMap[${status}]`]: {
                        page: 1,
                        totalPage: -1,
                        orderList: []
                    }
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(2) || '';
                item.orderTime = new Date(item.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
                this.setStatus(item);
            });
            this.data.orderListMap[status].orderList = this.data.orderListMap[status].orderList.concat(data.page.list);
            this.setData({
                [`orderListMap[${status}].orderList`]: this.data.orderListMap[status].orderList,
                [`orderListMap[${status}].page`]: this.data.orderListMap[status].page + 1,
                [`orderListMap[${status}].totalPage`]: this.data.orderListMap[status].totalPage,
            });
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.loading = false;
            this.data.orderListMap[status].request = null;
            this.setData({
                [`orderListMap[${status}].stopRefresh`]: true
            });
        });
    },
    onPass(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.dialog.confirm({
            message: '确定通过审核？'
        }).then(() => {
            wx.jyApp.http({
                url: '/nutritionorder/approve/quick',
                method: 'post',
                data: {
                    id: id
                }
            }).then((data) => {
                this.updateStatus(id, 0);
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
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/medical-record/index?from=examine'
            });
        }).finally((err) => {
            this.holding = false;
        });
    },
    updateStatus(id, status) {
        this.loadList(true, 100);
        this.loadList(true, 10);
        this.loadList(true, 0);
        this.loadList(true, 11);
        // for (var key in this.data.orderListMap) {
        //     var orderList = this.data.orderListMap[key];
        //     orderList.map((item, index) => {
        //         if (id == item.id) {
        //             item.status = status;
        //             this.setStatus(item);
        //             this.setData({
        //                 [`orderListMap[${key}].orderList[${index}]`]: item
        //             });
        //         }
        //     });
        // }
    },
    setStatus(item) {
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
    }
})