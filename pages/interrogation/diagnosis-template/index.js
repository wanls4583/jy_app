Page({
    data: {
        templateList: []
    },
    onLoad(option) {
        this.loadList();
    },
    onShow() {
        if (wx.refreshingDiagnosisTemplate) {
            this.loadList();
            delete wx.refreshingDiagnosisTemplate;
        }
    },
    onAdd() {
        wx.navigateTo({
            url: '/pages/interrogation/diagnosis-template-edit/index'
        });
    },
    onEdit(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/diagnosis-template-edit/index?id=' + id
        });
    },
    onDelete(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.dialog.confirm({
            message: '确认删除？'
        }).then(() => {
            wx.jyApp.http({
                url: '/diagnosis/template/delete',
                method: 'delete',
                data: {
                    id: id
                }
            }).then((data) => {
                wx.showToast({
                    title: '操作成功',
                    complete: () => {
                        this.loadList();
                    }
                });

            });
        })
    },
    onUse(e) {
        wx.jyApp.diagnosisTemplate = e.currentTarget.dataset.content;
        wx.navigateBack();
    },
    loadList() {
        wx.showLoading({ title: '加载中' });
        wx.jyApp.http({
            url: '/diagnosis/template/list'
        }).then((data) => {
            this.setData({
                templateList: data.list || []
            });
            wx.hideLoading();
        });
    }
})