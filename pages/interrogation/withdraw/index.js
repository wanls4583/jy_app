/*
 * @Author: lisong
 * @Date: 2020-11-30 09:33:23
 * @Description: 
 */
Page({
    data: {
        amount: '',
        doctorBankCard: null,
        type: 2
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo', 'userInfo'],
            actions: ['updateDoctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.checkAmount();
        if (this.data.type == 2) {
            this.getBankCard();
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        this.getBankCard();
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
    getBankCard() {
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/doctor/bankcard`,
        }).then((data) => {
            if (data.doctorBankCard && data.doctorBankCard.bankCardNumber) {
                data.doctorBankCard.fourNum = data.doctorBankCard.bankCardNumber.slice(-4);
            }
            this.setData({
                doctorBankCard: data.doctorBankCard
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    submit() {
        if (this.data.type == 2 && !this.data.doctorBankCard) {
            wx.jyApp.toast('请填写到账银行卡');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctorwithdraw/save',
            method: 'post',
            data: {
                amount: this.data.amount,
                type: this.data.type
            }
        }).then(() => {
            var balance = this.data.doctorInfo.balance - this.data.amount;
            this.data.doctorInfo.balance = balance.toFixed(2);
            this.updateDoctorInfo(Object.assign({}, this.data.doctorInfo));
            wx.jyApp.utils.navigateTo({
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