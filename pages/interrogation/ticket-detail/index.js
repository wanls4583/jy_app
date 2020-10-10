Page({
    data: {
        ticket: {}
    },
    onLoad(option) {
        this.orderId = option.id;
        this.orderType = option.orderType;
        this.loadInfo();
    },
    loadInfo() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/orderticket/info',
            data: {
                id: this.orderId,
                type: this.orderType
            }
        }).then((data) => {
            this.setData({
                ticket: data.ticket
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})