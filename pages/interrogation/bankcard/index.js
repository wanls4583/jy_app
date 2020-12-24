/*
 * @Author: lisong
 * @Date: 2020-12-22 17:14:31
 * @Description: 
 */
Page({
    data: {
        bankCardUsername: '',
        bankCardNumber: '',
        bankName: '',
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            bankCardUsername: this.data.doctorInfo.doctorName
        })
        this.getBankCard();
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
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onSubmit() {
        this.submit();
    },
    getBankCard() {
        wx.jyApp.http({
            url: `/doctor/bankcard`,
        }).then((data) => {
            if (data.doctorBankCard) {
                this.setData({
                    bankCardUsername: data.doctorBankCard.bankCardUsername,
                    bankCardNumber: data.doctorBankCard.bankCardNumber,
                    bankName: data.doctorBankCard.bankName,
                });
            }
        });
    },
    submit() {
        wx.jyApp.http({
            url: '/doctor/bankcard',
            method: 'post',
            data: {
                bankCardUsername: this.data.bankCardUsername,
                bankCardNumber: this.data.bankCardNumber,
                bankName: this.data.bankName,
                doctorId: this.data.doctorInfo.id
            }
        }).then(() => {
            wx.jyApp.toast('保存成功');
            wx.navigateBack();
        });
    }
})