Page({
    data: {
        diagnosis: '',
        goodsList: [],
        nutritionlist: [],
        nutritionVisible: false,
        totalAmount: 0,
        patient: {}
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
        this.setData({
            patient: wx.jyApp.getTempData('guidePatient')
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        wx.jyApp.clearTempData('guidePatient');
        wx.jyApp.clearTempData('guideGoodsList');
    },
    onShow() {
        var diagnosisTemplate = wx.jyApp.getTempData('diagnosisTemplate', true)
        if (diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: diagnosisTemplate
            });
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
                goodsList: this.data.goodsList.concat([])
            });
            wx.jyApp.clearTempData('usageGoods');
            this.caculateTotalAmount();
        }
        wx.jyApp.setTempData('guideGoodsList', this.data.goodsList.concat([]));
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
        wx.jyApp.diagnosisGoods = this.data.goodsList.map((item) => {
            return Object.assign({}, item);
        });
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
                goodsList: this.data.goodsList.concat([])
            });
            this.caculateTotalAmount();
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
    onSave() {
        if (!this.data.diagnosis && this.type != 2) {
            wx.jyApp.toast('临床诊断不能为空');
            return;
        }
        if (!this.data.goodsList.length) {
            wx.jyApp.toast('营养处方不能为空');
            return;
        }
        wx.jyApp.dialog.confirm({
            message: '保存后将发送该营养处方给患者，是否确定保存？'
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
                            amount: item.amount,
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
            totalAmount += Number(item.amount);
        });
        totalAmount += (Number(this.data.configData.deliveryCost) || 0);
        totalAmount = totalAmount.toFixed(2);
        this.setData({
            totalAmount: totalAmount
        });
    },
})