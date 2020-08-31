Page({
    data: {
        frequencyVisible: false,
        giveWayVisible: false,
        frequencyArray: wx.jyApp.constData.frequencyArray,
        giveWayList: [],
        frequency: '',
        _frequency: '',
        _giveWay: '',
        giveWay: ''
    },
    onLoad() {
        var giveWayMap = wx.jyApp.constData.giveWayMap;
        for (var key in giveWayMap) {
            this.data.giveWayList.push({
                label: giveWayMap[key],
                value: key
            });
        }
        this.setData({
            giveWayList: this.data.giveWayList
        });
    },
    onShowFrequency() {
        this.setData({
            frequencyVisible: true
        });
    },
    onShowGiveWay() {
        this.setData({
            giveWayVisible: true
        });
    },
    onConfirmFrequency(e) {
        this.setData({
            frequency: e.detail.index + 1,
            _frequency: e.detail.value,
            frequencyVisible: false
        });
    },
    onConfirmGiveWay(e) {
        this.setData({
            _giveWay: e.detail.value.label,
            giveWay: e.detail.value.value,
            giveWayVisible: false
        });
    },
    onCancel() {
        this.setData({
            frequencyVisible: false,
            giveWayVisible: false
        });
    }
})