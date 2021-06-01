/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        doctorList: [],
        result: 0,
        _result: '',
        color: ''
    },
    onLoad(option) {
        var result = option.result;
        var _result = '营养状况良好';
        var color = 'rgb(126,210,107)';
        if (result >= 1) {
            _result = '中度营养风险';
            color = 'rgb(238,103,66)';
        }
        if (result >= 2) {
            _result = '重度营养风险';
            color = 'rgb(238,103,66)';
        }
        this.setData({
            result: result,
            _result: _result,
            color: color,
        });
        this.loadDoctor();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //查看更多
    onClickMore(e) {
        wx.jyApp.utils.navigateTo({
            url: '/pages/mall/search-doctor/index?all=1'
        });
    },
    loadDoctor() {
        return wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: 1,
                limit: 6
            }
        }).then((data) => {
            this.setData({
                doctorList: data.page.list
            });
        })
    },
})