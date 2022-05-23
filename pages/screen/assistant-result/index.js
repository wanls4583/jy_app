/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description:
 */
Page({
    data: {
        doctorList: [],
        totalAmounts: [],
        plans: [],
        result: 0,
        _result: '',
        color: '',
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var results = wx.jyApp.getTempData('assistant-results') || null;
        var plans = wx.jyApp.getTempData('assistant-plans') || null;
        var result = option.result;
        var _result = option._result;
        var color = 'rgb(126,210,107)';
        wx.jyApp.setTempData('assistant-results', null);
        wx.jyApp.setTempData('assistant-plans', null);
        this.from = option.from || '';
        this.isEdit = option.isEdit || 'false';
        this.doctorId = option.doctorId || '';
        this.doctorName = option.doctorName || '';
        this.patient = wx.jyApp.getTempData('assistant-patient');
        this.consultOrderId = option.consultOrderId || '';
        if (result == 2) {
            color = 'rgb(240,139,72)';
        }
        if (result >= 3) {
            color = 'rgb(236,76,23)';
        }
        // 有营养风险
        if(result > 0 && option.share == 1 && this.data.userInfo.role == 'USER') {
            wx.jyApp.dialog.confirm({
                title: `分享`,
                message: `筛查结果有营养风险，请将筛查结果分享给医生，医生将为您提供营养支持治疗。`
            }).then(() => {
                this.onShareResult();
            });
        }
        this.setData({
            result: result,
            results: results,
            _result: _result,
            color: color,
            doctorId: this.doctorId,
            share: option.share,
            filtrateId: option.filtrateId,
            filtrateType: option.filtrateType,
            from: this.from,
        });
        if (result == 2 && (this.data.userInfo.role === 'DOCTOR' || (!this.doctorName && this.from === 'screen'))) {
            this.loadPlan().then(() => {
                this.setPlan(plans);
            });
        }
        if (this.data.userInfo.role === 'USER') {
            this.loadDoctor();
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onConsult() {
        wx.jyApp.utils.redirectTo({
            url: `/pages/interrogation/illness-edit/index?doctorId=${this.data.doctorId}&type=1`,
        });
    },
    //查看更多
    onClickMore(e) {
        if (this.data.userInfo.viewVersion == 2) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/my-doctor/index',
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/search-doctor/index?all=1',
            });
        }
    },
    // 分享结果给医生
    onShareResult() {
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/my-doctor/index?share=1&filtrateId=${this.data.filtrateId}&filtrateType=${this.data.filtrateType}`,
        });
    },
    onGuide(e) {
        let products = e.currentTarget.dataset.item;
        let param = this.consultOrderId ? `id=${this.consultOrderId}` : `patientId=${this.patient.id}`;
        wx.jyApp.setTempData('assistant-result-goods', products);
        wx.jyApp.setTempData('guidePatient', this.patient);
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/guidance-online/medical-record/index?${param}`,
        });
    },
    onBuy(e) {
        let products = e.currentTarget.dataset.item;
        wx.jyApp.setTempData('assistant-result-goods', products);
        wx.jyApp.utils.navigateTo({
            url: '/pages/mall/confirm-order/index',
        });
    },
    loadDoctor() {
        var url = this.data.userInfo.viewVersion == 2 ? '/hospital/department/user/doctor' : '/wx/user/doctor';
        return wx.jyApp
            .http({
                url: url,
            })
            .then((data) => {
                this.setData({
                    doctorList: data.list.slice(0, 6),
                });
            });
    },
    loadPlan() {
        return wx.jyApp
            .http({
                url: `/product/assistant/plan/list`,
            })
            .then((data) => {
                this.planList = data.list;
            });
    },
    setPlan(plans) {
        let plan1 = plans.plan1 || [];
        let plan2 = plans.plan2 || [];
        let products1 = [];
        let products2 = [];
        let totalAmount = 0;
        let totalAmounts = [];
        plans = [];
        plan1.forEach((item) => {
            let items = this.getProductListByPlanNumber(item);
            items &&
                products1.push(
                    ...items.map((_item) => {
                        _item = _setInfo(_item);
                        totalAmount += _item.amount;
                        return _item;
                    })
                );
        });
        totalAmounts.push(totalAmount.toFixed(2));
        totalAmount = 0;
        plan2.forEach((item) => {
            let items = this.getProductListByPlanNumber(item);
            items &&
                products2.push(
                    ...items.map((_item) => {
                        _item = _setInfo(_item);
                        totalAmount += _item.amount;
                        return _item;
                    })
                );
        });
        totalAmounts.push(totalAmount.toFixed(2));
        products1.length && plans.push(products1);
        products2.length && plans.push(products2);
        this.setData({
            plans: plans,
            totalAmounts: totalAmounts,
        });

        function _setInfo(item) {
            let goods = Object.assign({}, item.goods);
            goods.type = 1;
            goods.frequency = item.frequency;
            goods.giveWay = item.giveWay;
            goods.days = item.days;
            goods.count = item.gross;
            goods.amount = item.sumOfMoney;
            goods.perUseNum = item.perUseNum;
            goods.productSequence = item.productSequence;
            goods.remark = item.remark;
            goods._goodsName = `${goods.goodsName}(${goods.standardNum}${wx.jyApp.constData.unitChange[goods.standardUnit]}/${wx.jyApp.constData.unitChange[goods.unit]})`;
            goods._unit = wx.jyApp.constData.unitChange[goods.unit];
            goods._giveWay = wx.jyApp.constData.giveWayMap[goods.giveWay];
            goods._frequency = wx.jyApp.constData.frequencyArray[goods.frequency - 1];
            goods.goodsPic = (goods.goodsPic && goods.goodsPic.split(',')[0]) || '';
            goods.firstPic = goods.goodsPic;
            goods.productId = goods.productId;
            goods.usage = `${goods.days}天，${goods._frequency}，每次${goods.perUseNum}${wx.jyApp.constData.unitChange[goods.standardUnit]}，${goods._giveWay}`;
            return goods;
        }
    },
    getProductListByPlanNumber(planNumber) {
        for (let i = 0; i < this.planList.length; i++) {
            if (this.planList[i].planNumber === planNumber) {
                return this.planList[i].items;
            }
        }
    },
});
