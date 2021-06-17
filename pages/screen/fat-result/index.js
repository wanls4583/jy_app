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
        var result = option.result;
        var _result = option._result;
        var color = 'rgb(126,210,107)';
        if (result >= 1) {
            color = 'rgb(238,103,66)';
        }
        this.setData({
            result: result,
            _result: _result,
            color: color,
            from: option.from
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onBack() {
        wx.navigateBack();
    },
})