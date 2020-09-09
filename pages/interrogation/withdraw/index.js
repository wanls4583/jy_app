Page({
    data: {
        amount: ''
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
            actions: ['updateDoctorInfo'],
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
            amount: this.data.doctorInfo.balance
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
            var balance = this.data.doctorInfo.balance - this.data.amount;
            this.data.doctorInfo.balance = balance.toFixed(2);
            this.updateDoctorInfo(Object.assign({}, this.data.doctorInfo));
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({ title: '提现成功' });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})