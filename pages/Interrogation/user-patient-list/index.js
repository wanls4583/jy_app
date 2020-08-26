Page({
    data: {
        patientList: [],
        selectId: 0
    },
    onLoad(option) {
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
                "doctorId": 1,
                "patientId": this.data.selectId,
                "picUrls": wx.jyApp.illness.picUrls.join(',')
            }
        }).then((data) => {
            if (data.code == 0) {
                delete wx.jyApp.illness;
                wx.showToast({
                    title: '操作成功',
                    success: (result) => {

                    }
                });
            }
        });
    },
    loadList() {
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
                patientList: data.list || []
            });
        });
        // wx.jyApp.http({
        //     url: '/doctor/list',
        //     data: {
        //         page: 1,
        //         limit: 1000
        //     }
        // }).then((data) => {
        //     console.log(data);
        // })
    }
})