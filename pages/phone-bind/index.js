const app = getApp()

Page({
    data: {
        phone: '',
        starPhone: '',
        smsCode: '',
        sendTxt: '发送验证码',
        bindVisible: true
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
        this.storeBindings.updateStoreBindings();
        if (this.data.userInfo.phone) {
            this.setData({
                phone: this.data.userInfo.phone,
                bindVisible: false,
                starPhone: this.data.userInfo.phone.slice(0, 3) + '****' + this.data.userInfo.phone.slice(-4)
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        clearTimeout(this.toastTimer);
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    //更换手机号
    onClickChange() {
        this.setData({
            bindVisible: true
        });
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
            wx.jyApp.toast('发送成功');
            this.reduceSecond();
        });
    },
    reduceSecond() {
        var second = 60;
        var self = this;
        _reduce();
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
                smsCode: Number(this.data.smsCode)
            }
        }).then(() => {
            wx.showToast({
                title: '绑定成功'
            });
            this.toastTimer = setTimeout(() => {
                this.data.userInfo.phone = this.data.phone;
                this.updateUserInfo(Object.assign({}, this.data.userInfo));
                wx.navigateBack();
            }, 1500);
        });
    }
})