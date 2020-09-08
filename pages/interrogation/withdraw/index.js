Page({
    data: {
        amount: '',
        totalAmount: 0
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
    },
    onAll() {
        this.setData({
            amount: this.data.totalAmount
        });
    },
    onSubmit() {
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctorwithdraw/save',
            method: 'post',
            data: {
                amount: this.data.amount
            }
        }).then(() => {
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({ title: '提现成功' });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})