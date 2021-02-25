/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        active: 0,
    },
    onLoad(option) {
        this.inHospitalNumber = option.inHospitalNumber;
        this.isInpatient = option.isInpatient;
        this.patient = wx.jyApp.getTempData('nutritionPatient');
        this.patient._sex = this.patient.sex == 1 ? '男' : '女';
        this.setData({
            patient: this.patient
        });
        this.loadPatientDocument();
    },
    onUnload() {},
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    loadPatientDocument() {
        wx.jyApp.http({
            type: 'mobile',
            url: '/app/nutrition/query',
            data: {
                method: 'nutritionDocument',
                inHospitalNumber: this.inHospitalNumber,
                isInpatient: this.isInpatient
            }
        }).then((data) => {
            data = data.result;
            wx.jyApp.setTempData('medicalRecord', data);
        });
    }
})