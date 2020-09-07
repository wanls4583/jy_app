Page({
    data: {
        order: {}
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
            var order = data.consultOrder || data.detail;
            order.patient._sex = order.patient.sex == 1 ? '男' : '女';
            order._status = this.type == 'interrogation' ? wx.jyApp.constData.interrogationOrderStatusMap[order.status] : wx.jyApp.constData.applyOrderStatusMap[order.status];
            order.picUrls = order.picUrls && order.picUrls.split(',') || [];
            if (this.type == 'interrogation') {
                switch (order.status) {
                    case 0:
                    case 6:
                    case 7: order.statusColor = 'danger-color'; break;
                    case 1:
                    case 3: order.statusColor = 'success-color'; break;
                }
            } else {
                switch (order.status) {
                    case 0:
                    case 1:
                    case 4:
                    case 5: order.statusColor = 'danger-color'; break;
                    case 2: order.statusColor = 'success-color'; break;
                }
            }
            this.setData({
                order: order
            });
        });
    }
})