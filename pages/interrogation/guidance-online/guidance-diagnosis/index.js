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
        this.guidanceData = wx.jyApp.getTempData('guidanceData');
        if (guideOrderDetail) {
            this.setData({
                diagnosis: guideOrderDetail.diagnosis
            });
        }
        if (this.guidanceData.from == 'examine') {
            wx.setNavigationBarTitle({
                title: '审核营养指导'
            });
        }
    },
    onShow() {
        var diagnosisTemplate = wx.jyApp.getTempData('diagnosisTemplate', true);
        if (diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: diagnosisTemplate
            });
        } else if (this.guidanceData.diagnosis) {
            this.setData({
                diagnosis: this.guidanceData.diagnosis
            });
        }
    },
    onPre(e) {
        delete this.guidanceData.diagnosis;
        wx.navigateBack();
    },
    onNext(e) {
        if (this.data.diagnosis) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/guidance-product/index'
            });
        } else {
            wx.jyApp.toast('请输入诊断说明');
        }
    },
    onInput(e) {
        this.setData({
            diagnosis: e.detail.value
        });
        this.guidanceData.diagnosis = this.data.diagnosis;
    },
    onClickTemplate() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/diagnosis-template/index'
        });
    },
})