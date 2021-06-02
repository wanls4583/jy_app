/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        patientList: [],
        wayVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.getPatient();
        this.setData({
            doctorId: option.doctorId || '',
            doctorName: option.doctorName || '',
        });
    },
    onGoto(e) {
        // 医生角色
        if (this.data.userInfo.role == 'DOCTOR' && this.data.doctorInfo.authStatus == 1) {
            this.url = e.currentTarget.dataset.url;
            this.setData({
                wayVisible: true
            });
        } else {
            wx.jyApp.utils.navigateTo(e);
        }
    },
    onConfirm(e) {
        if (e.detail.value.value == 1) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/qrcode-share/index?from=screen&barcodeUrl=' + this.data.doctorInfo.barcodeUrl
            });
        } else if (e.detail.value.value == 2) {
            wx.jyApp.utils.navigateTo({
                url: this.url
            });
        }
        this.setData({
            wayVisible: false
        });
    },
    onCancel() {
        this.setData({
            wayVisible: false
        });
    },
    getPatient() {
        wx.jyApp.http({
            url: '/patientdocument/list',
            data: {
                page: 1,
                limit: 1
            }
        }).then((data) => {
            this.setData({
                patientList: data.list || []
            });
        });
    },
})