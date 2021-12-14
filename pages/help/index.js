Page({
    data: {
        categoryVisible: true,
        list: []
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onSubmit() {
        if (!this.data.content.length) {
            wx.jyApp.toast('请输入反馈内容');
            return;
        }
        if (this.data.phone.length && !/^1\d{10}$/.test(this.data.phone)) {
            wx.jyApp.toast('手机号输入错误');
            return;
        }
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
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({
                    title: '反馈成功'
                });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    },
    loadList() {
        wx.jyApp.http({
            url: '/question/list'
        }).then((data) => {
            this.setData({
                list: data.list
            });
        });
    }
})