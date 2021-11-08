/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        result: 0,
        _result: '',
        color: ''
    },
    onLoad(option) {
        var results = wx.jyApp.getTempData('act-results') || [];
        var result = option.result;
        var _result = option._result;
        var color = 'rgb(126,210,107)';
        this.patientId = option.patientId || '';
        this.consultOrderId = option.consultOrderId || '';
        if (result == 2) {
            color = 'rgb(240,139,72)';
        }
        if (result >= 3) {
            color = 'rgb(236,76,23)';
        }
        this.setData({
            result: result,
            results: results,
            _result: _result,
            color: color,
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onBack() {
        wx.navigateBack();
    },
    onNext() {
        wx.redirectTo({
            url: `/pages/screen/body-fat/index?consultOrderId=${this.consultOrderId}&patientId=${this.patientId}`
        });
    }
})