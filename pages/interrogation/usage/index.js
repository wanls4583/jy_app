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
        count: '',
        days: 7,
        modulateDose: 0,
        perUseNum: 1,
        frequencyDefault: 0,
        giveWayDefault: 0,
        nutritionVisible: false,
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
            totalAmount: goods.totalAmount || 0
        });
        if (!this.data.count) {
            this.caculateGross();
        }
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
        this.patitent = wx.jyApp.getTempData('guidePatient');
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
            totalAmount: (this.data.count * this.data.goods.price).toFixed(2)
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
        if (this.data.goods.type == 1) {
            count = Math.ceil(this.data.perUseNum * this.data.frequency * this.data.days / this.data.goods.standardNum) || 0;
        } else {
            count = Math.ceil(this.data.days * this.data.frequency) || 0;
        }
        this.setData({
            count: count,
            totalAmount: (count * this.data.goods.price).toFixed(2)
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
        this.data.goods.totalAmount = this.data.totalAmount;
        if (this.data.goods.type == 1) {
            this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}${this.data.unitChange[this.data.goods.standardUnit]}，${this.data._giveWay}`;
        } else {
            this.data.goods.usage = `${this.data.days}天，${this.data._frequency}，每次${this.data.perUseNum}份，${Number(this.data.modulateDose) ? '配制' + this.data.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
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
        var nutritionData = {};
        var goodsList = [];
        if (!this.data.allNutritionlist.length) {
            return;
        }
        this.prop.map(item => {
            nutritionData[item] = {
                name: wx.jyApp.constData.nutritionNameMap[item],
                standardData: 0,
                gross: 0, //每天总量
                grossPercent: 0, //每天总量占推荐值得比
                singleGross: 0 //单餐
            }
            if (['energy', 'protein', 'fat', 'carbohydrate'].indexOf(item) > -1) {
                nutritionData[item].energyPercent = '0%';
            }
        });
        guideGoodsList.map(item => {
            if (item.type == 1) {
                goodsList.push(item);
            } else {
                item.items.map(_item => {
                    _item.frequency = item.frequency;
                    goodsList.push(_item);
                });
            }
        });
        _analize.bind(this)(goodsList);

        function _analize(goodsList) {
            //获取推荐值
            this.prop.map(item => {
                nutritionData[item].standardData = wx.jyApp.utils.getSuggestData(item, this.patitent);
            });
            goodsList.map(goods => {
                for (var i = 0; i < this.data.allNutritionlist.length; i++) {
                    var item = this.data.allNutritionlist[i];
                    if (item.productId == goods.productId) {
                        this.prop.map(_item => {
                            nutritionData[_item].singleGross += item[_item] * goods.perUseNum * 0.01;
                            nutritionData[_item].gross += item[_item] * goods.perUseNum * goods.frequency * 0.01;
                        });
                        break;
                    }
                }
            });
            this.prop.map(item => {
                var nutrition = nutritionData[item];
                nutrition.singleGross = nutrition.singleGross.toFixed(2);
                nutrition.gross = nutrition.gross.toFixed(2);
                if (nutrition.standardData) {
                    nutrition.grossPercent = (nutrition.gross / nutrition.standardData * 100).toFixed(2);
                }
                if (nutritionData.energy.gross > 0) {
                    switch (item) {
                        case "energy":
                            nutrition.energyPercent = 100 + '%';
                            break;
                        case "protein":
                            nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                            break;
                        case "fat":
                            nutrition.energyPercent = nutrition.gross * 9 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                            break;
                        case "carbohydrate":
                            nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                            break;
                    }
                }
            });
            var arr = [];
            this.prop.map(item => {
                arr.push(nutritionData[item]);
            });
            this.setData({
                nutritionlist: arr
            });
        }
    },
})