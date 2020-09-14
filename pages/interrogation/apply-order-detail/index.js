Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
        this.type = option.type;
        this.id = option.id;
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //支付问诊单
    onInterrogationPay() {
        if (this.type != 'interrogation') {
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
                wx.navigateTo({
                    url: '/pages/interrogation/chat/index?id=' + this.id
                });
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(()=>{
            wx.hideLoading();
        });
    },
    loadInfo() {
        var url = '/apply/info/';
        if (this.type == 'interrogation') {
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
            var order = data.consultOrder || data.detail;
            order.patient._sex = order.patient.sex == 1 ? '男' : '女';
            order._status = this.type == 'interrogation' ? wx.jyApp.constData.interrogationOrderStatusMap[order.status] : wx.jyApp.constData.applyOrderStatusMap[order.status];
            order.picUrls = order.picUrls && order.picUrls.split(',') || [];
            if (this.type == 'interrogation') {
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
            this.setData({
                order: order
            });
        }).finally(() => {
            wx.hideLoading();
            this.loaded = true;
        })
    }
})