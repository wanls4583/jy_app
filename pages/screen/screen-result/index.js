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
        var results = wx.jyApp.getTempData('screen-results') || null;
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
            result: result,
            results: results,
            _result: _result,
            color: color,
            doctorId: option.doctorId || ''
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
    loadDoctor() {
        var url = this.data.userInfo.viewVersion == 2 ? '/hospital/department/user' : '/doctor/list';
        return wx.jyApp.http({
            url: url,
            data: {
                page: 1,
                limit: 6
            }
        }).then((data) => {
            if (this.data.userInfo.viewVersion == 2) {
                var list = [];
                data.list.map((item) => {
                    var arr = item.doctors || [];
                    arr.map((_item) => {
                        _item.departmentName = item.departmentName;
                        _item.hospitalName = item.hospitalName;
                    });
                    list = list.concat(item.doctors || []);
                });
                this.setData({
                    'doctorList': list.slice(0, 6)
                });
            } else {
                this.setData({
                    doctorList: data.page.list
                });
            }
        })
    },
})