Page({
    data: {
        order: {},
        type: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'configData']
        });
        this.storeBindings.updateStoreBindings();
        this.id = option.id;
        this.setData({
            type: option.type
        });
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        if (this.loaded) {
            this.loadInfo();
        }
    },
    //支付问诊单
    onInterrogationPay() {
        if (this.data.type != 'interrogation') {
            wx.jyApp.toast('申请订单不能再次支付');
            return;
        }
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/consultorder/pay',
            method: 'post',
            data: {
                id: this.id
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                this.loadInfo();
                if(this.order.type != 3) { //视频问诊不需要跳到聊天页面
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/interrogation/chat/index?id=' + this.id
                    });
                }
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    //点击图片放大
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        var picUrls = e.currentTarget.dataset.picUrls;
        wx.previewImage({
            current: src,
            urls: picUrls
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e, this);
    },
    //删除问诊订单
    onDelInterrogation(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/consultorder/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        if (page) {
                            page.deleteInterrogationItem(id);
                        }
                        wx.navigateBack();
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    //删除申请订单
    onDelApplyOrder(e) {
        wx.showModal({
            content: '确认删除此订单？',
            success: (res) => {
                if (res.confirm) {
                    var id = e.currentTarget.dataset.id;
                    wx.showLoading('删除中...', true);
                    wx.jyApp.http({
                        url: '/apply/delete',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(() => {
                        var page = wx.jyApp.utils.getPages('pages/order-list/index');
                        if (page) {
                            page.deleteApplyItem(id);
                        }
                        wx.navigateBack();
                    }).finally(() => {
                        wx.hideLoading();
                    });
                }
            }
        });
    },
    loadInfo() {
        if (wx.jyApp.tempData.applyOrderData) {
            _initData.bind(this)(wx.jyApp.tempData.applyOrderData);
            delete wx.jyApp.tempData.applyOrderData;
            return;
        }
        var url = '/apply/info/';
        if (this.data.type == 'interrogation') {
            url = '/consultorder/info/';
        }
        if (!this.loaded) {
            wx.showLoading({
                title: '加载中'
            });
        }
        wx.jyApp.http({
            url: url + this.id
        }).then((data) => {
            _initData.bind(this)(data);
        }).finally(() => {
            wx.hideLoading();
            this.loaded = true;
        });
        function _initData(data) {
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            var order = data.consultOrder || data.detail;
            order.patient._sex = order.patient.sex == 1 ? '男' : '女';
            order.patient.BMI = (order.patient.weight) / (order.patient.height * order.patient.height / 10000);
            order.patient.BMI = order.patient.BMI && order.patient.BMI.toFixed(2) || '';
            order.picUrls = order.picUrls && order.picUrls.split(',') || [];
            this.setStatusColor(order);
            if (this.data.type == 'interrogation') {
                order.orderTime = typeof order.orderTime == 'string' ? Date.prototype.parseDateTime(order.orderTime) : order.orderTime;
                order.ticketDays = Math.ceil((todayBegin - order.orderTime) / aDay);
                order.orderTime = new Date(order.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
                order._status = wx.jyApp.constData.interrogationOrderStatusMap[order.status];
                order.applyTicketVisible = order.ticketDays <= this.data.configData.allowApplyTicketDays && order.orderAmount > 0 && order.status == 3 || false;
                order.oneMoreVisible = [3, 4, 7].indexOf(order.status) > -1;
                order.delVisible = [0, 3, 4, 7].indexOf(order.status) > -1;
                if (order.videoBookDateTime) {
                    order.videoBookDateTime = new Date(order.videoBookDateTime);
                    order.videoBookDateTime = order.videoBookDateTime.formatTime('yyyy-MM-dd') + '&nbsp;' + wx.jyApp.constData.dayArr[order.videoBookDateTime.getDay()] + '&nbsp;' + order.videoBookDateTime.formatTime('hh:mm')
                }
            } else {
                order.ticketDays = Math.ceil((todayBegin - Date.prototype.parseDateTime(order.createTime)) / aDay);
                order._status = wx.jyApp.constData.applyOrderStatusMap[order.status];
                order.applyTicketVisible = order.ticketDays <= this.data.configData.allowApplyTicketDays && order.price > 0 && order.status == 2 || false;
                order.delVisible = [2, 5].indexOf(order.status) > -1;
            }
            this.setData({
                order: order
            });
        }
    },
    setStatusColor(order) {
        if (this.data.type == 'interrogation') {
            switch (order.status) {
                case 0:
                case 6:
                case 7:
                    order.statusColor = 'danger-color';
                    break;
                case 1:
                case 3:
                    order.statusColor = 'success-color';
                    break;
            }
        } else {
            switch (order.status) {
                case 0:
                case 1:
                case 4:
                case 5:
                    order.statusColor = 'danger-color';
                    break;
                case 2:
                    order.statusColor = 'success-color';
                    break;
            }
        }
    }
})