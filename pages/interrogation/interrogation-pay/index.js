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
                wx.navigateBack({
                    delta: 3,
                    success: () => {
                        wx.navigateTo({
                            url: '/pages/interrogation/chat/index?id=' + this.id
                        });
                    }
                });
            }).catch(() => {
                setTimeout(() => {
                    wx.jyApp.toast('支付失败');
                }, 500);
                wx.navigateBack({
                    delta: 3,
                    success: () => {
                        wx.navigateTo({
                            url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + this.id
                        });
                    }
                });
            });
        }).catch(() => {
            wx.hideLoading();
        });
    }
})