Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        typeVisible: false,
        frequencyVisible: false,
        giveWayVisible: false,
        frequencyArray: [],
        giveWayList: [],
        typeList: [],
        _type: '',
        type: '',
        _frequency: '',
        frequency: '',
        _giveWay: '',
        giveWay: '',
        amount: 0,
        count: '',
        days: 7,
        modulateDose: 0,
        perUseNum: 1,
        typeDefault: 0,
        frequencyDefault: 0,
        giveWayDefault: 0,
        nutritionVisible: false,
        goodsList: [],
        patient: {},
        dateVisible: false,
        beginDate: '',
        _beginDate: new Date().getTime(),
        executiveTime: []
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['allNutritionlist'],
        });
        this.storeBindings.updateStoreBindings();
        var giveWayMap = wx.jyApp.constData.giveWayMap;
        var giveWayList = [];
        var longOrTemporaryMap = wx.jyApp.constData.longOrTemporaryMap;
        var typeList = [];
        var goods = wx.jyApp.getTempData('usageGoods') || {};
        for (var key in giveWayMap) {
            giveWayList.push({
                label: giveWayMap[key],
                value: key
            });
        }
        for (var key in longOrTemporaryMap) {
            typeList.push({
                label: longOrTemporaryMap[key],
                value: key
            });
        }
        this.setData({
            patient: wx.jyApp.getTempData('guidePatient'),
            frequencyArray: wx.jyApp.constData.frequencyArray.slice(0, 6),
            goods: goods,
            perUseNum: goods.perUseNum || 1,
            days: goods.days || 7,
            count: goods.count || '',
            modulateDose: goods.modulateDose || 0,
            giveWay: goods.giveWay || giveWayList[0].value,
            remark: goods.remark,
            _giveWay: giveWayMap[goods.giveWay] || giveWayList[0].label,
            frequency: goods.frequency || 1,
            _frequency: wx.jyApp.constData.frequencyArray[goods.frequency - 1] || wx.jyApp.constData.frequencyArray[0],
            frequencyDefault: goods.frequency - 1 || 0,
            amount: goods.amount || 0
        });
        giveWayList.map((item, index) => {
            if (this.data.giveWay == item.value) {
                this.setData({
                    giveWayDefault: index
                });
            }
        });
        this.setData({
            giveWayList: giveWayList,
            typeList: typeList,
        });
        this.anlizeNutrition();
    },
    onUnload() {
        if (!this.saved) {
            wx.jyApp.clearTempData('usageGoods');
        }
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    //配制时间
    onChangeExecutiveTime(e) {
        this.setData({
            'executiveTime': e.detail,
        });
    },
    onShowDate() {
        this.setData({
            dateVisible: true
        });
    },
    onConfirmDate(e) {
        var beginDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            beginDate: beginDate,
            dateVisible: false
        });
    },
    onCancelDate() {
        this.setData({
            dateVisible: false
        });
    },
    //手动改变总量(总量为整数)
    onCountChang(e) {
        var days = 0;
        var count = e.detail;
        this.count = count;
        if (count == this.data.count) {
            return;
        }
        if (this.data.goods.type == 1) {
            days = count * this.data.goods.standardNum / this.data.perUseNum / this.data.frequency;
        } else {
            days = count / this.data.frequency;
        }
        this.setData({
            count: count,
            days: Number(days.toFixed(2))
        });
        this.setData({
            amount: (this.data.count * this.data.goods.price).toFixed(2)
        });
    },
    onDaysPlus(e) {
        var days = this.days || this.data.days;
        if (!this.inputDays) {
            days += 1;
        }
        e.detail = {
            value: Math.floor(days) || 1
        };
        this.days = 0;
        setTimeout(() => {
            this.onDaysBlur(e);
        }, 0);
    },
    onDaysMinus(e) {
        var days = this.days || this.data.days;
        if (!this.inputDays) {
            days -= 1;
        }
        e.detail = {
            value: Math.ceil(days) || 1
        };
        this.days = 0;
        setTimeout(() => {
            this.onDaysBlur(e);
        }, 0);
    },
    onDaysChange(e) {
        this.days = e.detail;
        this.inputDays = true;
    },
    onDaysBlur(e) {
        if (e.detail.value == this.data.days) {
            return;
        }
        this.days = e.detail.value;
        this.setData({
            days: Number(e.detail.value) || 1
        });
        this.caculateGross();
        this.inputDays = false;
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
    onShowType() {
        this.setData({
            typeVisible: true
        });
    },
    onConfirmFrequency(e) {
        this.setData({
            frequency: e.detail.index + 1,
            _frequency: e.detail.value,
            frequencyVisible: false
        });
        this.caculateGross();
        this.anlizeNutrition();
    },
    onConfirmGiveWay(e) {
        this.setData({
            _giveWay: e.detail.value.label,
            giveWay: e.detail.value.value,
            giveWayVisible: false
        });
    },
    onConfirmType(e) {
        this.setData({
            _type: e.detail.value.label,
            type: e.detail.value.value,
            typeVisible: false
        });
    },
    onCancel() {
        this.setData({
            typeVisible: false,
            frequencyVisible: false,
            giveWayVisible: false
        });
    },
    caculateGross() {
        var count = 0;
        if (this.data.goods.type == 1) {
            count = Math.ceil(this.data.perUseNum * this.data.frequency * this.data.days / this.data.goods.standardNum) || 0;
        } else {
            count = Math.ceil(this.data.days * this.data.frequency) || 0;
        }
        this.setData({
            count: count,
            amount: (count * this.data.goods.price).toFixed(2)
        });
    },
    onChangePerUseNum(e) {
        this.onInputNum(e);
        this.anlizeNutrition();
    },
    onShowAnalize() {
        this.setData({
            nutritionVisible: true
        });
    },
    onCloseAnalize() {
        this.setData({
            nutritionVisible: false
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
        this.data.goods.count = this.data.count;
        this.data.goods.modulateDose = this.data.modulateDose;
        this.data.goods.remark = this.data.remark;
        this.data.goods.amount = this.data.amount;
        wx.navigateBack({
            delta: 2
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
    },
    //营养素分析
    anlizeNutrition() {
        var usageGoods = this.data.goods;
        usageGoods.perUseNum = this.data.perUseNum;
        usageGoods.frequency = this.data.frequency;
        //已添加的指导
        var guideGoodsList = (wx.jyApp.getTempData('guideGoodsList') || []).concat([]);
        var index = 0;
        var arr = guideGoodsList.filter((item) => {
            return item.type == usageGoods.type && item.id == usageGoods.id;
        });
        if (!arr.length) {
            guideGoodsList.push(usageGoods);
        } else {
            guideGoodsList.map((item, _index) => {
                if (item.type == usageGoods.type && item.id == usageGoods.id) {
                    index = _index;
                }
            });
            guideGoodsList.splice(index, 1, usageGoods);
        }
        this.setData({
            goodsList: guideGoodsList
        });
    },
})