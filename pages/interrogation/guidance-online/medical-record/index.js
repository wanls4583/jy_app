/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        isFirst: 1,
        foodSensitive: '',
        hasFoodSensitive: 0,
        mainSuit: '',
        currentDisease: '',
        historyDisease: '',
        symptom: '',
        handlePlan: ''
    },
    onLoad(option) {
        var patient = wx.jyApp.getTempData('guidePatient');
        patient._sex = patient.sex == 1 ? '男' : '女';
        patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
        patient.BMI = patient.BMI && patient.BMI.toFixed(2) || '';
        this.setData({
            patient: patient
        });
        if (patient.foodSensitive) {
            this.setData({
                hasFoodSensitive: 1,
                foodSensitive: patient.foodSensitive
            });
        }
    },
    onUnload() {},
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
    },
    onSave() {
        if (this.data.hasFoodSensitive == 1 && !this.data.foodSensitive) {
            wx.jyApp.toast('请输入食物史');
            return;
        }
        wx.jyApp.setTempData('guidanceData', {
            consultOrderId: this.consultOrderId,
            isFirst: this.data.isFirst,
            foodSensitive: this.data.foodSensitive,
            mainSuit: this.data.mainSuit,
            currentDisease: this.data.currentDisease,
            historyDisease: this.data.historyDisease,
            symptom: this.data.symptom,
            handlePlan: this.data.handlePlan
        });
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/guidance-online/guidance-diagnosis/index'
        });
    }
})