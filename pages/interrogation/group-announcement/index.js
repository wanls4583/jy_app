Page({
    data: {
        notice: '',
        editNotice: '',
        edit: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.roomInfo = wx.jyApp.getTempData('roomInfo');
        this.setData({
            notice: this.roomInfo.notice || '',
            editNotice: this.roomInfo.notice || ''
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onEdit() {
        this.setData({
            edit: true
        });
    },
    onCancel() {
        this.setData({
            edit: false
        });
    },
    onSave() {
        if (!this.data.editNotice) {
            wx.jyApp.toast('请输入群公告');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/hospital/department/notice/update`,
            method: 'post',
            data: {
                notice: this.data.editNotice,
                id: this.roomInfo.departmentId,
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.toastBack('保存成功');
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page && page.route == 'pages/interrogation/chat-v2/index') {
                page.setData({
                    'roomInfo.notice': this.data.editNotice,
                });
            }
        }).catch(() => {
            wx.hideLoading();
        });
    },
})