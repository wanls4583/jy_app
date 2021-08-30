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
            suggestion: suggestion
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
    }
})