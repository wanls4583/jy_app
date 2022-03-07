/*
 * @Author: lisong
 * @Date: 2020-11-30 09:33:23
 * @Description: 
 */
Page({
    data: {
        realName: '',
        amount: '',
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            canWithdraw: option && option.canWithdraw || 0
        })
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {},
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail
        });
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
    },
    onAll() {
        this.setData({
            amount: this.data.canWithdraw
        });
    },
    onSubmit() {
        this.submit();
    },
    submit() {
        if (!(this.data.amount <= this.data.canWithdraw)) {
            wx.jyApp.toast('提现金额需小于等于可提现金额');
            return 0;
        }
        if (!this.data.amount) {
            wx.jyApp.toast('请填写提现金额');
            return 0;
        }
        if (!this.data.realName) {
            wx.jyApp.toast('请填写真实姓名');
            return 0;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/userwithdraw/save',
            method: 'post',
            data: {
                realName: this.data.realName,
                amount: this.data.amount,
            }
        }).then(() => {
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/withdraw-list/index'
            });
            setTimeout(() => {
                wx.showToast({
                    title: '提现成功'
                });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})