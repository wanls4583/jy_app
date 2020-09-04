Page({
    data: {
        phone: '',
        content: ''
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
    },
    onUnload() {
        clearTimeout(this.toastTimer);
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onSubmit() {
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/usersuggestion/save',
            method: 'post',
            data: {
                content: this.data.content,
                phone: this.data.phone,
                side: this.data.userInfo.role == 'DOCTOR' ? 'DOCTOR' : 'USER'
            }
        }).then(() => {
            wx.jyApp.toast('反馈成功');
            this.toastTimer = setTimeout(()=>{
                wx.navigateBack();
            }, 1500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})