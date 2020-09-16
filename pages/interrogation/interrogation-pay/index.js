Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.id = option.id;
        this.loadInfo();
    },
    loadInfo() {
        wx.showLoading({
            title: '加载中'
        });
        wx.jyApp.http({
            url: '/consultorder/info/' + this.id
        }).then((data) => {
            this.setData({
                order: data.consultOrder || {}
            });
        }).finally(() => {
            wx.hideLoading();
        })
    },
    onSubmit() {
        var self = this;
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
                wx.jyApp.payInterrogationResult = {
                    id: self.id,
                    result: 'success'
                }
                wx.navigateBack({
                    delta: 3
                });
            }).catch(() => {
                wx.jyApp.payInterrogationResult = {
                    id: self.id,
                    result: 'fail'
                }
                wx.navigateBack({
                    delta: 3
                });
            });
        }).catch(() => {
            wx.hideLoading();
        });
    }
})