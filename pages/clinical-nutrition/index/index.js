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
        var patient = wx.jyApp.getTempData('nutritionPatient');
        var BMI = (patient.weight) / (patient.stature * patient.stature / 10000);
        BMI = BMI && BMI.toFixed(2) || '';
        patient._sex = patient.sex == 1 ? '男' : '女';
        this.setData({
            patient: patient
        });
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
})