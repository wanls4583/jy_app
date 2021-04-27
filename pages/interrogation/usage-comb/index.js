Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        giveWayVisible: false,
        giveWayList: [],
        _frequency: '',
        _giveWay: '',
        giveWay: '',
        amount: 0,
        count: '',
        days: '',
        modulateDose: 0,
        remark: '',
        giveWayDefault: 0,
        productList: [],
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
            patient: wx.jyApp.getTempData('guidePatient'),
            goods: goods,
            days: goods.days,
            count: goods.count || 1,
            modulateDose: goods.modulateDose || 0,
            giveWay: goods.giveWay,
            remark: goods.remark,
            _giveWay: giveWayMap[goods.giveWay],
            _frequency: wx.jyApp.constData.frequencyArray[goods.frequency - 1],
            amount: goods.amount || goods.price
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
            amount: (count * this.data.goods.price).toFixed(2)
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
        //检查库存
        wx.jyApp.http({
            url: '/goods/queryStock',
            data: {
                ids: this.data.goods.id
            }
        }).then((data) => {
            var tiped = false;
            if(!data.list[0]) {
                wx.jyApp.toast(`${this.data.goods.goodsName}库存查询失败`);
                return;
            }
            return data.list[0].items.every((item) => {
                for (var i = 0; i < this.data.productList.length; i++) {
                    var obj = this.data.productList[i];
                    var count = this.data.count * obj.gross;
                    if (obj.productId == item.productId) {
                        if (item.availNum < count && !tiped) {
                            wx.jyApp.toast(`${item.productName}太热销啦，仅剩下${item.availNum}${wx.jyApp.constData.unitChange[item.useUnit]}`);
                            tiped = true;
                        }
                        return item.availNum >= count
                    }
                }
                if(!tiped) {
                    tiped = true;
                }
            });
        }).then((enough) => {
            if (enough) {
                this.saved = true;
                this.data.goods.perUseNum = 1;
                this.data.goods.giveWay = this.data.giveWay;
                this.data.goods.days = this.data.days;
                this.data.goods.count = this.data.count;
                this.data.goods.remark = this.data.remark;
                this.data.goods.amount = this.data.amount;
                this.data.goods.usage = `${(this.data.days * this.data.count).toFixed(2)}天，${this.data._frequency}，${Number(this.data.goods.modulateDose) ? '配制' + this.data.goods.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
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
    loadProduct() {
        wx.jyApp.http({
            url: `/goods/info/${this.data.goods.goodsId || this.data.goods.id}`
        }).then((data) => {
            this.setData({
                productList: data.info.items,
            });
        });
    },
    //营养素分析
    anlizeNutrition() {
        var usageGoods = this.data.goods;
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