Page({
    data: {
        goodsList: [],
        nutritionlist: [],
        nutritionVisible: false,
        totalAmount: 0,
        rejectVisible: false,
        approveMsg: ''
    },
    onLoad(option) {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'allNutritionlist'],
            actions: ['updateAllNutritionlist']
        });
        this.storeBindings.updateStoreBindings();
        this.guidanceData = wx.jyApp.getTempData('guidanceData');
        this.patitent = wx.jyApp.getTempData('guidePatient');
        this.consultOrderId = this.guidanceData.consultOrderId;
        this.diagnosis = this.guidanceData.diagnosis;
        this.getAllNutrition();
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
        if (guideOrderDetail && this.guidanceData.from == 'examine') { //审核
            this.setData({
                from: this.guidanceData.from,
                goodsList: guideOrderDetail.goods.map((item) => {
                    item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                    item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                    item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                    if (item.type == 1) {
                        item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                    } else {
                        item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}份，${Number(item.modulateDose) ? '配制' + item.modulateDose + '毫升，' : ''}${item._giveWay}`;
                    }
                    return item;
                })
            })
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        wx.jyApp.clearTempData('guideGoodsList');
    },
    onShow() {
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
            this.caculateTotalAmount();
            this.anlizeNutrition();
        }
        wx.jyApp.setTempData('guideGoodsList', this.data.goodsList.concat([]));
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
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
            wx.jyApp.setTempData('guideGoodsList', this.data.goodsList.concat([]));
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
    onPre() {
        wx.navigateBack();
    },
    onSave() {
        if (!this.diagnosis) {
            wx.jyApp.toast('营养诊断不能为空');
            return;
        }
        if (!this.data.goodsList.length) {
            wx.jyApp.toast('营养指导不能为空');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/nutritionorder/save',
            method: 'post',
            data: {
                ...this.guidanceData,
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
        }).then((data) => {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/guidance-sheet/index?id=' + data.id
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    //通过审核
    onPass() {
        this.approve(1);
    },
    onReject() {
        this.approve(0, this.data.approveMsg);
    },
    onShowReject() {
        this.setData({
            rejectVisible: true
        });
    },
    onCloseReject() {
        this.setData({
            rejectVisible: false
        });
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    approve(status, approveMsg) {
        if (!this.diagnosis) {
            wx.jyApp.toast('营养诊断不能为空');
            return;
        }
        if (!this.data.goodsList.length) {
            wx.jyApp.toast('营养指导不能为空');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/nutritionorder/approve',
            method: 'post',
            data: {
                ...this.guidanceData,
                status: status,
                approveMsg: approveMsg || '',
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
                        goodsId: item.goodsId || item.id,
                        modulateDose: item.modulateDose,
                        num: item.count,
                        perUseNum: item.perUseNum,
                        remark: item.remark
                    }
                })
            }
        }).then((data) => {
            if (status == 1) {
                var page = wx.jyApp.utils.getPages('pages/order-list/index');
                if (page) { //申请指导已完成
                    page.loadApplyOrderList(true);
                }
                page = wx.jyApp.utils.getPages('pages/apply-order-detail/index');
                if (page) { //开指导已完成，改变申请单详情状态
                    page.loadInfo();
                }
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/guidance-online/guidance-sheet/index?from=examine&id=' + data.id
                });
            } else {
                wx.navigateBack({
                    delta: 3
                });
            }
        }).finally(() => {
            this.setData({
                rejectVisible: false
            });
            wx.hideLoading();
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
                singleGross: 0 //单餐
            }
            if (['energy', 'protein', 'fat', 'carbohydrate'].indexOf(item) > -1) {
                nutritionData[item].energyPercent = '0%';
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
    //获取所有产品营养素
    getAllNutrition() {
        wx.jyApp.http({
            url: '/product/nutritionist/all'
        }).then((data) => {
            this.updateAllNutritionlist(data.list || []);
            if (this.data.goodsList.length) {
                this.caculateTotalAmount();
                this.anlizeNutrition();
            }
        });
    }
})