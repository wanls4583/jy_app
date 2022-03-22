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
        var title = option.title || '评估结果';
        var suggestion = option.suggestion || '';
        var results = wx.jyApp.getTempData('evaluate-results') || [];
        var result = option.result;
        var _result = option._result;
        var color = 'rgb(126,210,107)';
        wx.jyApp.setTempData('evaluate-results', null);
        if (result == 2) {
            color = 'rgb(240,139,72)';
        }
        if (result >= 3) {
            color = 'rgb(236,76,23)';
        }
        this.setData({
            title: title,
            result: result,
            results: results,
            _result: _result,
            color: color,
            suggestion: suggestion,
            share: option.share,
            filtrateId: option.filtrateId,
            filtrateType: option.filtrateType
        });
        wx.setNavigationBarTitle({
            title: title
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onBack() {
        wx.navigateBack();
    },
    // 分享结果给医生
    onShareResult() {
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/my-doctor/index?share=1&filtrateId=${this.data.filtrateId}&filtrateType=${this.data.filtrateType}`
        });
    },
})