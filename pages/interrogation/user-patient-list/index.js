Page({
    data: {
        patientList: [],
        selectId: 0,
        ifSelect: false
    },
    onLoad(option) {
        this.doctorId = option.doctorId;
        this.setData({
            ifSelect: wx.jyApp.selectPatientFlag || false
        });
        wx.jyApp.selectPatientFlag = false;
        this.loadList();
    },
    onShow() {
        if (wx.jyApp.reloadPatientList) {
            this.loadList();
            delete wx.jyApp.reloadPatientList;
        }
    },
    selectPatient(e) {
        var id = e.currentTarget.dataset.id;
        this.setData({
            selectId: id
        });
    },
    onSave() {
        if (!this.data.selectId) {
            wx.jyApp.toast('请选择患者');
            return;
        }
        wx.jyApp.http({
            url: '/consultorder/save',
            method: 'post',
            data: {
                "diseaseDetail": wx.jyApp.illness.diseaseDetail,
                "doctorId": this.doctorId,
                "patientId": this.data.selectId,
                "picUrls": wx.jyApp.illness.picUrls.join(',')
            }
        }).then((data) => {
            delete wx.jyApp.illness;
            if (data.params) {
                wx.jyApp.utils.pay(data.params).then(() => {
                    wx.navigateBack({
                        delta: 2,
                        success: function() {
                            wx.navigateTo({
                                url: '/pages/interrogation/chat/index?id=' + data.id
                            });
                        }
                    });
                }).catch(() => {
                    wx.jyApp.toast('支付失败');
                });
            } else if (data.id) {
                wx.navigateBack({
                    delta: 2,
                    success: function() {
                        wx.navigateTo({
                            url: '/pages/interrogation/chat/index?id=' + data.id
                        });
                    }
                });
            }
        });
    },
    onChange(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            selectId: item.id
        });
    },
    onEdit(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/user-patient-edit/index?id=' + id
        });
    },
    onAdd(e) {
        wx.navigateTo({
            url: '/pages/interrogation/user-patient-edit/index'
        });
    },
    loadList() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        wx.jyApp.http({
            url: '/patientdocument/list',
            data: {
                page: 1,
                limit: 1000
            }
        }).then((data) => {
            data.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.age = new Date().getFullYear() - Date.prototype.parseDate(item.birthday).getFullYear();
            });
            this.setData({
                patientList: data.list || [],
                selectId: this.data.selectId || (data.list.length ? data.list[0].id : 0)
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})