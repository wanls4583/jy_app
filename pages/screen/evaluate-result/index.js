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
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
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
        // 有营养风险
        if(result > 0 && option.share == 1 && this.data.userInfo.role == 'USER') {
            wx.jyApp.dialog.confirm({
                title: `分享`,
                message: `筛查结果有营养风险，请将筛查结果分享给医生，医生将为您提供营养支持治疗。`
            }).then(() => {
                this.onShareResult();
            });
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
    onUnload() {
        this.storeBindings.destroyStoreBindings();
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