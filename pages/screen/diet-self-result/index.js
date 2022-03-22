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
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
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
            result: result,
            results: results,
            _result: _result,
            color: color,
            doctorId: option.doctorId || '',
            share: option.share,
            filtrateId: option.filtrateId,
            filtrateType: option.filtrateType
        });
        this.loadDoctor();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onConsult() {
        wx.jyApp.utils.redirectTo({
            url: `/pages/interrogation/illness-edit/index?doctorId=${this.data.doctorId}&type=1`
        })
    },
    //查看更多
    onClickMore(e) {
        if (this.data.userInfo.viewVersion == 2) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/my-doctor/index'
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/search-doctor/index?all=1'
            });
        }
    },
    // 分享结果给医生
    onShareResult() {
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/my-doctor/index?share=1&filtrateId=${this.data.filtrateId}&filtrateType=${this.data.filtrateType}`
        });
    },
    loadDoctor() {
        var url = this.data.userInfo.viewVersion == 2 ? '/hospital/department/user/doctor' : '/wx/user/doctor';
        return wx.jyApp.http({
            url: url
        }).then((data) => {
            this.setData({
                doctorList: data.list.slice(0, 6)
            });
        })
    },
})