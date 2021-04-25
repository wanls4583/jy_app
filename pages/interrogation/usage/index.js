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
        amount: 0,
        count: '',
        countMax: Infinity,
        days: 7,
        maxDays: 99,
        modulateDose: 0,
        perUseNum: 1,
        frequencyDefault: 0,
        giveWayDefault: 0,
        nutritionVisible: false,
        goodsList: [],
        patient: {}
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['allNutritionlist'],
        });
        this.storeBindings.updateStoreBindings();
        var giveWayMap = wx.jyApp.constData.giveWayMap;
        var giveWayList = [];
        var goods = wx.jyApp.getTempData('usageGoods');
        goods.hideBtn = true;
        for (var key in giveWayMap) {
            giveWayList.push({
                label: giveWayMap[key],
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
        this.prop = [
            'energy',
            'protein',
            'fat',
            'carbohydrate',
            'cholesterol',
            'vitaminB1',
            'vitaminB2',
            'niacin',
            'vitaminC',
            'vitaminE',
            'ca',
            'p',
            'k',
            'na',
            'mg',
            'fe',
            'zn',
            'se',
            'cu',
            'mn',
            'i',
        ]
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
    //手动改变总量(总量为整数)
    onCountChang(e) {
        var days = 0;
        var count = e.detail;
        var countMax = this.data.countMax;
        this.count = count;
        if (count == this.data.count) {
            return;
        }
        if (this.data.goods.type == 1) {
            days = count * this.data.goods.standardNum / this.data.perUseNum / this.data.frequency;
            countMax = Math.ceil(this.data.maxDays * this.data.frequency * this.data.perUseNum / this.data.goods.standardNum);
            if (days > this.data.maxDays) {
                days = this.data.maxDays;
                count = Math.ceil(days * this.data.frequency * this.data.perUseNum / this.data.goods.standardNum);
                var _days = count * this.data.goods.standardNum / this.data.perUseNum / this.data.frequency;
                if (_days <= days) {
                    days = _days;
                }
            }
        } else {
            days = count / this.data.frequency;
            countMax = Math.ceil(this.data.maxDays * this.data.frequency);
            if (days > this.data.maxDays) {
                days = this.data.maxDays;
                count = Math.ceil(days * this.data.frequency);
                var _days = count / this.data.frequency;
                if (_days <= days) {
                    days = _days;
                }
            }
        }
        this.setData({
            count: count || 1,
            countMax: countMax,
            days: Number(days.toFixed(2))
        });
        this.setData({
            amount: (this.data.count * this.data.goods.price).toFixed(2)
        });
    },
    onDaysChange(e) {
        this.setData({
            days: Number(e.detail) || 1
        });
        this.caculateGross();
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
        this.anlizeNutrition();
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
        var count = 0;
        var countMax = this.data.countMax;
        if (this.data.goods.type == 1) {
            count = Math.ceil(this.data.perUseNum * this.data.frequency * this.data.days / this.data.goods.standardNum) || 0;
            countMax = Math.ceil(this.data.maxDays * this.data.frequency * this.data.perUseNum / this.data.goods.standardNum);
        } else {
            count = Math.ceil(this.data.days * this.data.frequency) || 0;
            countMax = Math.ceil(this.data.maxDays * this.data.frequency) || 0;
        }
        this.setData({
            count: count,
            countMax: countMax,
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
        //检查库存
        wx.jyApp.http({
            url: '/goods/queryStock',
            data: {
                ids: this.data.goods.id
            }
        }).then((data) => {
            return data[this.data.goods.id].availNum >= this.data.count;
        }).then((enough) => {
            if (enough) {
                this.saved = true;
                this.data.goods.frequency = this.data.frequency;
                this.data.goods.giveWay = this.data.giveWay;
                this.data.goods.days = this.data.days;
                this.data.goods.perUseNum = this.data.perUseNum;
                this.data.goods.count = this.data.count;
                this.data.goods.modulateDose = this.data.modulateDose;
                this.data.goods.remark = this.data.remark;
                this.data.goods.amount = this.data.amount;
                if (this.data.goods.type == 1) {
                    this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}${this.data.unitChange[this.data.goods.standardUnit]}，${this.data._giveWay}`;
                } else {
                    this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}份，${Number(this.data.modulateDose) ? '配制' + this.data.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
                }
                var pages = getCurrentPages();
                wx.navigateBack({
                    delta: pages[pages.length - 2].route == 'pages/interrogation/search/index' ? 3 : (pages[pages.length - 2].route == 'pages/interrogation/product-list/index' ? 2 : 1)
                });
            }
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