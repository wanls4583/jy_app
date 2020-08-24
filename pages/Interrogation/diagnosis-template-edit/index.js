Page({
    data: {
        templateName: '',
        content: '',
        id: ''
    },
    onLoad(option) {
        if (option.id) {
            this.setData({
                id: option.id
            });
            this.loadInfo();
        }
    },
    loadInfo() {
        wx.showLoading({
            title: '加载中'
        });
        wx.jyApp.http({
            url: '/online/nutrition/api/diagnosis/template/info/' + this.data.id
        }).then((data) => {
            this.setData({
                templateName: data.diagnosisTemplate.templateName,
                content: data.diagnosisTemplate.content
            });
            wx.hideLoading();
        });
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onSave() {
        if (!this.data.templateName) {
            wx.jyApp.toast('请输入模板名称');
            return;
        }
        if (!this.data.content) {
            wx.jyApp.toast('请输入模板内容');
            return;
        }
        wx.jyApp.http({
            url: `/online/nutrition/api/diagnosis/template/${this.data.id?'update':'save'}`,
            method: 'post',
            data: {
                id: this.data.id,
                templateName: this.data.templateName,
                content: this.data.content
            }
        }).then(() => {
            wx.showToast({
                title: '操作成功'
            });
            wx.refreshingDiagnosisTemplate = true;
            wx.navigateBack();
        });
    }
})