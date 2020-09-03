Page({
    data: {
        patientList: [],
        selectId: 0,
        ifSelect: false
    },
    onLoad(option) {
        this.doctorId = option.doctorId;
    },
    onShow() {
        this.setData({
            ifSelect: wx.jyApp.selectPatientFlag || false
        });
        wx.jyApp.selectPatientFlag = false;
        this.loadList();
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
            if (data.code == 0) {
                delete wx.jyApp.illness;
                wx.showToast({
                    title: '操作成功',
                    success: (result) => {
                        this.gotoChat(data.id);
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
            wx.hideLoading();
            data.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.age = new Date().getFullYear() - Date.prototype.parseDate(item.birthday).getFullYear();
            });
            this.setData({
                patientList: data.list || [],
                selectId: this.data.selectId || (data.list.length ? data.list[0].id : 0)
            });
        }).catch(()=>{
            wx.hideLoading();
        });
    }
})