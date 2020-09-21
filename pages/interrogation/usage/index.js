Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        frequencyVisible: false,
        giveWayVisible: false,
        frequencyArray: [],
        giveWayList: [],
        frequency: '',
        _frequency: '',
        _giveWay: '',
        giveWay: '',
        totalAmount: 0,
        gross: 1,
        days: 7,
        modulateDose: 0,
        perUseNum: 1,
        frequencyDefault: 0,
        giveWayDefault: 0
    },
    onLoad() {
        var giveWayMap = wx.jyApp.constData.giveWayMap;
        var giveWayList = [];
        var goods = wx.jyApp.usageGoods;
        goods._unit = goods.type == 1 ? wx.jyApp.constData.unitChange[goods.unit] : '份';
        for (var key in giveWayMap) {
            giveWayList.push({
                label: giveWayMap[key],
                value: key
            });
        }
        this.setData({
            frequencyArray: wx.jyApp.constData.frequencyArray.slice(0, 6),
            goods: goods,
            perUseNum: goods.perUseNum || 1,
            days: goods.days || 7,
            modulateDose: goods.modulateDose || 0,
            giveWay: goods.giveWay || giveWayList[0].value,
            remark: goods.remark,
            _giveWay: giveWayMap[goods.giveWay] || giveWayList[0].label,
            frequency: goods.frequency || 1,
            _frequency: wx.jyApp.constData.frequencyArray[goods.frequency - 1] || wx.jyApp.constData.frequencyArray[0],
            frequencyDefault: goods.frequency - 1 || 0
        });
        this.caculateGross();
        giveWayList.map((item, index) => {
            if (this.data.giveWay == item.value) {
                this.setData({
                    giveWayDefault: index
                });
            }
        });
        this.setData({
            giveWayList: giveWayList
        });
    },
    onUnload() {
        if (!this.saved) {
            wx.jyApp.usageGoods = undefined;
        }
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    //输入数字
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        this.caculateGross();
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
        this.caculateGross();
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
    },
    caculateGross() {
        var gross = 0;
        if (this.data.goods.type == 1) {
            gross = Math.ceil(this.data.perUseNum * this.data.frequency * this.data.days / this.data.goods.standardNum);
        } else {
            gross = this.data.days * this.data.frequency;
        }
        this.setData({
            gross: gross,
            totalAmount: (gross * this.data.goods.price).toFixed(2)
        });
    },
    onSave() {
        if (!Number(this.data.perUseNum)) {
            wx.jyApp.toast('请输入每次用量');
            return;
        }
        this.saved = true;
        this.data.goods.frequency = this.data.frequency;
        this.data.goods.giveWay = this.data.giveWay;
        this.data.goods.days = this.data.days;
        this.data.goods.perUseNum = this.data.perUseNum;
        this.data.goods.gross = this.data.gross;
        this.data.goods.modulateDose = this.data.modulateDose;
        this.data.goods.remark = this.data.remark;
        this.data.goods.totalAmount = this.data.totalAmount;
        if (this.data.goods.type == 1) {
            this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}${this.data.unitChange[this.data.goods.standardUnit]}，${this.data._giveWay}`;
        } else {
            this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}份，${this.data.modulateDose ? '配制' + this.data.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
        }
        var pages = getCurrentPages();
        wx.navigateBack({
            delta: pages[pages.length - 2].route == 'pages/interrogation/search/index' ? 3 : (pages[pages.length - 2].route == 'pages/interrogation/product-list/index' ? 2 : 1)
        });
    },
    onBack() {
        if (!this.saved) {
            wx.jyApp.dialog.confirm({
                message: '当前数据未保存，是否离开？'
            }).then(() => {
                wx.navigateBack();
            });
        }
    }
})