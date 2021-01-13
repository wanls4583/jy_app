/*
 * @Author: lisong
 * @Date: 2021-01-12 18:41:39
 * @Description: 
 */
Page({
    data: {
        diagnosis: '',
    },
    onLoad(option) {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        if (guideOrderDetail) {
            this.setData({
                diagnosis: guideOrderDetail.diagnosis
            });
        }
    },
    onShow() {
        var diagnosisTemplate = wx.jyApp.getTempData('diagnosisTemplate', true);
        if (diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: diagnosisTemplate
            });
        }
    },
    onPre(e) {
        delete wx.jyApp.getTempData('guidanceData').diagnosis;
        wx.navigateBack();
    },
    onNext(e) {
        if (this.data.diagnosis) {
            wx.jyApp.getTempData('guidanceData').diagnosis = this.data.diagnosis;
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/guidance-product/index'
            });
        } else {
            wx.jyApp.toast('请输入营养诊断');
        }
    },
    onInput(e) {
        this.setData({
            diagnosis: e.detail.value
        });
    },
    onClickTemplate() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/diagnosis-template/index'
        });
    },
})