Page({
    data: {
        amount: ''
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo', 'userInfo'],
            actions: ['updateDoctorInfo'],
        });
        this.checkAmount();
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
    //检查金额是否有变化
    checkAmount() {
        return wx.jyApp.http({
            url: '/systemnotice/settle'
        }).then((data) => {
            if (data.notice) {
                wx.showModal({
                    title: '提示',
                    content: data.notice.content,
                    showCancel: false,
                    confirmText: '我知道了'
                });
                this.read(data.notice.id);
            }
        });
    },
    onSubmit() {
        this.submit();
    },
    //消息置为已读
    read(noticeId) {
        wx.jyApp.http({
            url: `/systemnotice/read/${noticeId}`,
            method: 'post',
        });
    },
    submit() {
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
            wx.navigateTo({
                url: '/pages/interrogation/withdraw-list/index'
            });
            setTimeout(() => {
                wx.showToast({ title: '提现成功' });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})