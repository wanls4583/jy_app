Page({
    data: {
        order: null
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
        this.orderId = option.id;
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //支付商城订单
    onMallOrderPay(e) {
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/wx/pay/submit',
            method: 'post',
            data: {
                id: this.orderId
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.showToast({
                    title: '支付成功'
                });
                this.loadInfo();
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(()=>{
            wx.hideLoading();
        });
    },
    loadInfo() {
        !this.loaded && wx.showLoading({
            title: '加载中...'
        });
        wx.jyApp.http({
            url: `/order/info/${this.orderId}`
        }).then((data) => {
            data.order._status = wx.jyApp.constData.mallOrderStatusMap[data.order.status];
            data.order.goods.map((_item) => {
                _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
            });
            switch (data.order.status) {
                case 0:
                case 5:
                case 6:
                    data.order.statusColor = 'danger-color';
                    break;
                case 1:
                case 7:
                case 8:
                    data.order.statusColor = 'success-color';
                    break;
            }
            this.setData({
                order: data.order
            });
        }).finally(() => {
            !this.loaded && wx.hideLoading();
            this.loaded = true;
        });
    }
})