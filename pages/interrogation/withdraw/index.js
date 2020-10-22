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
        if (!Number(this.data.amount)) {
            wx.jyApp.toast('请输入提现金额');
            return;
        }
        if (!this.data.amount > this.data.doctorInfo.balance) {
            wx.jyApp.toast('提现金额不能大于' + this.data.doctorInfo.balance);
            return;
        }
        return wx.jyApp.http({
            url: '/systemnotice/settle'
        }).then((data) => {
            if (data.notice) {
                wx.showModal({
                    title: '提示',
                    content: data.notice.content,
                    showCancel: false,
                    confirmText: '同意',
                    success(res) {
                        if (res.confirm) {
                            this.noticeId = data.notice.id;
                            this.submit();
                        }
                    }
                });
            } else {
                this.submit();
            }
        });
    },
    onSubmit() {
        this.checkAmount();
    },
    //同意
    read() {
        wx.jyApp.http({
            url: `/systemnotice/read/${this.noticeId}`,
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
            this.read();
        }).finally(() => {
            wx.hideLoading();
        });
    }
})