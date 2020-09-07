Page({
    data: {
        order: {},
        statusColor: 'danger-color'
    },
    onLoad(option) {
        this.type = option.type;
        this.id = option.id;
        this.loadInfo();
    },
    loadInfo() {
        var url = '/apply/info/';
        if (this.type == 'interrogation') {
            url = '/consultorder/info/';
        }
        wx.showLoading({
            title: '加载中'
        });
        wx.jyApp.http({
            url: url + this.id
        }).then((data) => {
            wx.hideLoading();
            data.consultOrder = data.consultOrder || data.detail;
            data.consultOrder.patient._sex = data.consultOrder.patient.sex == 1 ? '男' : '女';
            data.consultOrder._status = this.type == 'interrogation' ? wx.jyApp.constData.interrogationOrderStatusMap[data.consultOrder.status] : wx.jyApp.constData.applyOrderStatusMap[data.consultOrder.status];
            data.consultOrder.picUrls = data.consultOrder.picUrls && data.consultOrder.picUrls.split(',') || [];
            this.setData({
                order: data.consultOrder
            });
            if ([1, 7, 8].indexOf(this.data.order.status) > -1) {
                this.setData({
                    statusColor: 'success-color'
                });
            }
        });
    }
})