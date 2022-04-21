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
        var results = wx.jyApp.getTempData('results') || [];
        var result = option.result;
        var _result = option._result;
        var color = 'rgb(126,210,107)';
        this.patientId = option.patientId || '';
        this.doctorId = option.doctorId || '';
        this.consultOrderId = option.consultOrderId || '';
        this.from = option.from || '';
        this.roomId = option.roomId || '';
        wx.jyApp.setTempData('results', null);
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
            share: option.share || '',
            filtrateId: option.filtrateId || '',
            filtrateType: option.filtrateType || ''
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onBack() {
        wx.navigateBack();
    },
    onNext() {
        let url = '';
        switch (this.data.filtrateType) {
            case 'FAT-ACTION':
                url = '/pages/screen/body-fat/index';
                break;
            case 'FAT-DIET':
                url = '/pages/screen/sit-investigate/index';
                break;
            case 'FAT-SIT':
                url = '/pages/screen/sleep-assess/index';
                break;
            case 'FAT-SLEEP':
                url = '/pages/screen/act-assess/index';
                break;
        }
        if (this.data.filtrateType === 'FAT-BODY') { //最后一项评估
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page.route == 'pages/screen/fat-assess/index') {
                wx.jyApp.utils.navigateBack({
                    success: function () {
                        page.switchTab(1);
                    }
                })
            } else {
                wx.jyApp.utils.redirectTo({
                    url: `/pages/screen/fat-assess/index?active=1&consultOrderId=${this.consultOrderId}&patientId=${this.patientId}&doctorId=${this.doctorId}&from=${this.from}&roomId=${this.roomId}`
                });
            }
        } else {
            wx.jyApp.utils.redirectTo({
                url: `${url}?consultOrderId=${this.consultOrderId}&patientId=${this.patientId}&doctorId=${this.doctorId}&from=${this.from}&roomId=${this.roomId}&share=${this.data.share}`
            });
        }
    },
    // 分享结果给医生
    onShareResult() {
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/my-doctor/index?share=1&filtrateId=${this.data.filtrateId}&filtrateType=${this.data.filtrateType}`
        });
    },
})