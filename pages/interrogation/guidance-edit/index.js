Page({
    data: {
        diagnosis: '',
        goodsList: [],
        totalAmount: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.consultOrderId = option.id;
        this.type = option.type; //问诊类型
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        if (wx.jyApp.tempData.diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: wx.jyApp.tempData.diagnosisTemplate
            });
            delete wx.jyApp.tempData.diagnosisTemplate;
        }
        if (wx.jyApp.tempData.usageGoods) { //添加了商品
            var usageGoods = wx.jyApp.tempData.usageGoods;
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
            delete wx.jyApp.tempData.usageGoods;
            this.caculateTotalAmount();
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
        });
    },
    onEdit(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        wx.jyApp.tempData.usageGoods = item;
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
                            days: item.days,
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
    }
})