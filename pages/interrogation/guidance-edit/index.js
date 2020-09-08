Page({
    data: {
        diagnosis: '',
        goodsList: [],
        totalAmount: 0
    },
    onLoad(option) {
        this.consultOrderId = option.id;
    },
    onShow() {
        if (wx.jyApp.diagnosisTemplate) { //选择了模板
            this.setData({
                diagnosis: wx.jyApp.diagnosisTemplate
            });
            delete wx.jyApp.diagnosisTemplate;
        }
        if (wx.jyApp.usageGoods) { //添加了商品
            var usageGoods = wx.jyApp.usageGoods;
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
            delete wx.jyApp.usageGoods;

            var totalAmount = 0;
            this.data.goodsList.map((item) => {
                totalAmount += item.price * item.gross;
            });
            totalAmount = totalAmount.toFixed(2);
            this.setData({
                totalAmount: totalAmount
            });
        }
    },
    onInput(e) {
        this.setData({
            diagnosis: e.detail.value
        });
    },
    onClickTemplate() {
        wx.navigateTo({
            url: '/pages/interrogation/diagnosis-template/index'
        });
    },
    onAddGoods() {
        wx.jyApp.diagnosisGoods = wx.jyApp.diagnosisGoods || [];
        wx.navigateTo({
            url: '/pages/interrogation/product-list/index'
        });
    },
    onDelete(e) {
        var index = e.currentTarget.dataset.index;
        this.data.goodsList.splice(index, 1);
        this.setData({
            goodsList: this.data.goodsList
        });
    },
    onEdit(e) {
        var item = Object.assign({}, e.currentTarget.dataset.item);
        wx.jyApp.usageGoods = item;
        wx.navigateTo({
            url: '/pages/interrogation/usage/index'
        });
    },
    onSave() {
        if (!this.data.diagnosis) {
            wx.jyApp.toast('诊断信息不能为空');
            return;
        }
        if (!this.data.diagnosis) {
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
                consultOrderId: this.consultOrderId,
                diagnosis: this.data.diagnosis,
                totalAmount: this.data.totalAmount,
                goods: this.data.goodsList.map((item) => {
                    return {
                        amount: (item.price * item.gross).toFixed(2),
                        days: item.days,
                        frequency: item.frequency,
                        giveWay: item.giveWay,
                        goodsId: item.id,
                        modulateDose: item.modulateDose,
                        num: item.gross,
                        perUseNum: item.perUseNum,
                        remark: item.remark
                    }
                })
            }
        }).then(() => {
            setTimeout(() => {
                wx.showToast({
                    title: '提交成功'
                });
            }, 500);
            wx.navigateBack();
        }).finally(() => {
            wx.hideLoading();
        });
    }
})