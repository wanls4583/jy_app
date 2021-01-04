Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        giveWayVisible: false,
        giveWayList: [],
        _frequency: '',
        _giveWay: '',
        giveWay: '',
        totalAmount: 0,
        count: '',
        days: '',
        modulateDose: 0,
        remark: '',
        giveWayDefault: 0,
        productList: [],
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
        var goods = wx.jyApp.getTempData('usageGoods');;
        goods.hideBtn = true;
        goods.hideDays = true;
        for (var key in giveWayMap) {
            giveWayList.push({
                label: giveWayMap[key],
                value: key
            });
        }
        this.setData({
            goods: goods,
            days: goods.days,
            count: goods.count || 1,
            modulateDose: goods.modulateDose || 0,
            giveWay: goods.giveWay,
            remark: goods.remark,
            _giveWay: giveWayMap[goods.giveWay],
            _frequency: wx.jyApp.constData.frequencyArray[goods.frequency - 1],
            totalAmount: goods.totalAmount || goods.price
        });
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
        this.loadProduct();
        this.patitent = wx.jyApp.getTempData('guidePatient');
        this.prop = ['ca',
            'carbohydrate',
            'cholesterol',
            'cu',
            'energy',
            'fat',
            'fe',
            'i',
            'k',
            'mg',
            'mn',
            'na',
            'niacin',
            'p',
            'protein',
            'se',
            'vitaminB1',
            'vitaminB2',
            'vitaminC',
            'vitaminE',
            'zn'
        ]
        this.anlizeNutrition();
    },
    onUnload() {
        if (!this.saved) {
            wx.jyApp.clearTempData('usageGoods');
        }
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //手动改变总量(总量为整数)
    onCountChang(e) {
        var count = e.detail;
        this.setData({
            count: count,
            totalAmount: (count * this.data.goods.price).toFixed(2)
        });
    },
    onShowGiveWay() {
        this.setData({
            giveWayVisible: true
        });
    },
    onConfirmGiveWay(e) {
        this.setData({
            _giveWay: e.detail.value.label,
            giveWay: e.detail.value.value,
            giveWayVisible: false
        });
        this.anlizeNutrition();
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
    onCancel() {
        this.setData({
            giveWayVisible: false
        });
    },
    onSave() {
        this.saved = true;
        this.data.goods.perUseNum = 1;
        this.data.goods.giveWay = this.data.giveWay;
        this.data.goods.days = this.data.days;
        this.data.goods.count = this.data.count;
        this.data.goods.remark = this.data.remark;
        this.data.goods.totalAmount = this.data.totalAmount;
        this.data.goods.usage = `${(this.data.days * this.data.count).toFixed(2)}天，${this.data._frequency}，${Number(this.data.goods.modulateDose) ? '配制' + this.data.goods.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
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
    loadProduct() {
        wx.jyApp.http({
            url: `/goods/info/${this.data.goods.id}`
        }).then((data) => {
            this.setData({
                productList: data.info.items,
            });
        });
    },
    //营养素分析
    anlizeNutrition() {
        var usageGoods = this.data.goods;
        usageGoods.perUseNum = this.data.perUseNum;
        usageGoods.frequency = this.data.frequency;
        //已添加的指导
        var guideGoodsList = wx.jyApp.getTempData('guideGoodsList') || [];
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
                energyPercent: 0, //能量占比
                singleGross: 0 //单餐
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
                            nutrition.energyPercent = 100;
                            break;
                        case "protein":
                            nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2);
                            break;
                        case "fat":
                            nutrition.energyPercent = nutrition.gross * 9 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2);
                            break;
                        case "carbohydrate":
                            nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                            nutrition.energyPercent = nutrition.energyPercent.toFixed(2);
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