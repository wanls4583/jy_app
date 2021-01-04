Page({
    data: {
        diagnosis: '',
        goodsList: [],
        nutritionlist: [],
        nutritionVisible: false,
        totalAmount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'allNutritionlist'],
            actions: ['updateAllNutritionlist']
        });
        this.storeBindings.updateStoreBindings();
        this.consultOrderId = option.id;
        this.type = option.type; //问诊类型
        this.patitent = wx.jyApp.getTempData('guidePatient');
        this.getAllNutrition();
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
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        wx.jyApp.clearTempData('guidePatient');
    },
    onShow() {
        if (wx.jyApp.tempData.diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: wx.jyApp.tempData.diagnosisTemplate
            });
            delete wx.jyApp.tempData.diagnosisTemplate;
        }
        var usageGoods = wx.jyApp.getTempData('usageGoods');
        if (usageGoods) { //添加了商品
            var index = 0;
            var arr = this.data.goodsList.filter((item) => {
                return item.type == usageGoods.type && item.id == usageGoods.id;
            });
            if (!arr.length) {
                this.data.goodsList.push(usageGoods);
            } else {
                this.data.goodsList.map((item, _index) => {
                    if (item.type == usageGoods.type && item.id == usageGoods.id) {
                        index = _index;
                    }
                });
                this.data.goodsList.splice(index, 1, usageGoods);
            }
            this.setData({
                goodsList: this.data.goodsList
            });
            wx.jyApp.clearTempData('usageGoods');
            wx.jyApp.setTempData('guideGoodsList', this.data.goodsList.concat([]));
            this.caculateTotalAmount();
            this.anlizeNutrition();
        }
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onInput(e) {
        this.setData({
            diagnosis: e.detail.value
        });
    },
    onClickTemplate() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/diagnosis-template/index'
        });
    },
    onAddGoods() {
        wx.jyApp.diagnosisGoods = wx.jyApp.diagnosisGoods || [];
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/product-list/index'
        });
    },
    onDelete(e) {
        var index = e.currentTarget.dataset.index;
        wx.jyApp.dialog.confirm({
            message: '确认删除？'
        }).then(() => {
            this.data.goodsList.splice(index, 1);
            this.setData({
                goodsList: this.data.goodsList
            });
            this.caculateTotalAmount();
            this.anlizeNutrition();
        });
    },
    onEdit(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        wx.jyApp.setTempData('usageGoods', item);
        if (item.type == 3) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/usage-comb/index'
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/usage/index'
            });
        }
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
        if (!this.data.diagnosis && this.type != 2) {
            wx.jyApp.toast('营养诊断不能为空');
            return;
        }
        if (!this.data.goodsList.length) {
            wx.jyApp.toast('营养指导不能为空');
            return;
        }
        wx.jyApp.dialog.confirm({
            message: '保存后将发送该营养指导给患者，是否确定保存？'
        }).then(() => {
            wx.showLoading({
                title: '提交中...',
                mask: true
            });
            wx.jyApp.http({
                url: '/nutritionorder/save',
                method: 'post',
                data: {
                    consultOrderId: this.consultOrderId,
                    diagnosis: this.data.diagnosis,
                    totalAmount: this.data.totalAmount,
                    goods: this.data.goodsList.map((item) => {
                        var days = item.days;
                        if (item.type == 3) {
                            days = Number((item.days * item.count).toFixed(2));
                        }
                        return {
                            amount: (item.price * item.count).toFixed(2),
                            days: days,
                            frequency: item.frequency,
                            giveWay: item.giveWay,
                            goodsId: item.id,
                            modulateDose: item.modulateDose,
                            num: item.count,
                            perUseNum: item.perUseNum,
                            remark: item.remark
                        }
                    })
                }
            }).then(() => {
                setTimeout(() => {
                    wx.jyApp.toast('提交成功');
                }, 500);
                wx.navigateBack();
                var page = wx.jyApp.utils.getPages('pages/order-list/index');
                if (page) { //已完成
                    page.loadApplyOrderList(true);
                }
                page = wx.jyApp.utils.getPages('pages/apply-order-detail/index');
                if (page) { //已完成
                    page.loadInfo();
                }
            }).finally(() => {
                wx.hideLoading();
            });
        });
    },
    //计算总金额
    caculateTotalAmount() {
        var totalAmount = 0;
        this.data.goodsList.map((item) => {
            totalAmount += item.price * item.count;
        });
        totalAmount += (Number(this.data.configData.deliveryCost) || 0);
        totalAmount = totalAmount.toFixed(2);
        this.setData({
            totalAmount: totalAmount
        });
    },
    //营养素分析
    anlizeNutrition() {
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
        this.data.goodsList.map(item => {
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
    //获取所有产品营养素
    getAllNutrition() {
        wx.jyApp.http({
            url: '/product/nutritionist/all'
        }).then((data) => {
            this.updateAllNutritionlist(data.list || []);
        });
    }
})