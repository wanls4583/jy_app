const app = getApp()

Page({
    data: {
        phone: '',
        sendTxt: '发送验证码'
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
        if (option.phone) {
            this.setData({
                phone: option.phone
            });
        }
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onSend() {
        if (this.data.sendTxt != '发送验证码') {
            return;
        }
        if (!/1\d{10}/.test(this.data.phone)) {
            wx.jyApp.toast('请输入正确的手机号');
            return;
        }
        this.phone = this.data.phone;
        wx.jyApp.http({
            url: '/sms/send',
            method: 'post',
            data: {
                phone: this.data.phone
            }
        }).then((data) => {
            this.smsCode = data.smsCode;
            this.reduceSecond();
        });
    },
    reduceSecond() {
        var second = 60;
        var self = this;
        function _reduce() {
            if (second <= 0) {
                self.setData({
                    sendTxt: '发送验证码'
                });
                return;
            }
            self.setData({
                sendTxt: second + 's'
            });
            clearTimeout(self.secondTimer);
            self.secondTimer = setTimeout(() => {
                second--;
                _reduce();
            }, 1000);
        }
    },
    onSave() {
        wx.jyApp.http({
            url: '/sms/bind',
            method: 'post',
            data: {
                phone: this.phone,
                smsCode: this.smsCode
            }
        }).then(() => {
            this.data.userInfo.phone = this.data.phone;
            this.updateUserInfo(Object.assign({}, this.data.userInfo));
            wx.showToast({
                title: '操作成功',
                complete: () => {
                    wx.navigateBack();
                }
            });
        });
    }
})