Page({
    data: {
        guidanceOrder: {
            orderList: [],
            page: 1,
            limit: 10,
            totalPage: -1,
            stopRefresh: false,
            startDate: new Date().getTime(),
            _startDate: '',
            endDate: 0,
            _endDate: '',
            startDateVisible: false,
            endDateVisible: false
        },
        screen: {
            list: [],
            page: 1,
            totalPage: -1,
            stopRefresh: false
        },
        active: 0
    },
    onLoad(option) {
        this.doctorId = option.doctorId;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadGuidanceOrderList();
        this.loadScreenList();
        wx.setNavigationBarTitle({
            title: option.doctorName || ''
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onShowDate(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}.startDateVisible`]: true
        });
    },
    onConfirmStartDate(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}.startDateVisible`]: false,
            [`${prop}.endDateVisible`]: true,
            [`${prop}.startDate`]: e.detail,
            [`${prop}.endDate`]: 0,
            [`${prop}._startDate`]: new Date(e.detail).formatTime('yyyy-MM-dd'),
        })
    },
    onCancelStart(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}._startDate`]: '',
            [`${prop}.startDateVisible`]: false,
            [`${prop}.endDateVisible`]: true,
        })
    },
    onConfirmEndDate(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}.endDate`]: e.detail,
            [`${prop}._endDate`]: new Date(e.detail).formatTime('yyyy-MM-dd'),
            [`${prop}.endDateVisible`]: false
        })
        switch (prop) {
            case 'interrogationOrder':
                this.loadInterrogationOrderList(true);
                break;
            case 'applyOrder':
                this.loadApplyOrderList(true);
                break;
            case 'guidanceOrder':
                this.loadGuidanceOrderList(true);
                break;
        }
    },
    onCancelEnd(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}._endDate`]: '',
            [`${prop}.endDateVisible`]: false
        })
        this.loadGuidanceOrderList(true);
    },
    onGuidanceOrderRefresh() {
        this.loadGuidanceOrderList(true);
    },
    onGuidanceOrderLoadMore() {
        this.loadGuidanceOrderList();
    },
    onScreenRefresh() {
        this.loadScreenList(true);
    },
    onScreenLoadMore() {
        this.loadScreenList();
    },
    loadGuidanceOrderList(refresh) {
        if (refresh) {
            this.guidanceRequest && this.guidanceRequest.requestTask.abort();
        } else if (this.data.guidanceOrder.loading || this.data.guidanceOrder.totalPage > -1 && this.data.guidanceOrder.page > this.data.guidanceOrder.totalPage) {
            return;
        }
        this.data.guidanceOrder.loading = true;
        this.guidanceRequest = wx.jyApp.http({
            url: '/nutritionorder/list/v2',
            data: {
                doctorId: this.doctorId,
                page: refresh ? 1 : this.data.guidanceOrder.page,
                limit: this.data.guidanceOrder.limit,
                startDate: this.data.guidanceOrder._startDate,
                endDate: this.data.guidanceOrder._endDate
            }
        });
        this.guidanceRequest.then((data) => {
            if (refresh) {
                this.setData({
                    'guidanceOrder.orderList': [],
                    'guidanceOrder.page': 1,
                    'guidanceOrder.totalPage': -1,
                    'guidanceOrder.stopRefresh': false,
                });
            }
            var todayBegin = Date.prototype.getTodayBegin();
            var aDay = 24 * 60 * 60 * 1000;
            data.page.list.map((item) => {
                item._status = wx.jyApp.constData.mallOrderStatusMap[item.status];
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                item.goods.map((_item) => {
                    if (_item.type == 1) {
                        _item.goodsName = `${_item.goodsName}(${_item.items[0].standardNum}${wx.jyApp.constData.unitChange[_item.items[0].standardUnit]}/${wx.jyApp.constData.unitChange[_item.unit]})`;
                    }
                    _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                    _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
                });
                this.setStatusColor(item, 'mall');
            });
            this.setData({
                'guidanceOrder.totalAmount': data.totalAmount || '',
                'guidanceOrder.page': this.data.guidanceOrder.page + 1,
                'guidanceOrder.totalPage': data.page.totalPage,
                'guidanceOrder.orderList': this.data.guidanceOrder.orderList.concat(data.page.list)
            });
        }).finally(() => {
            this.guidanceRequest = null;
            this.data.guidanceOrder.loading = false;
            this.setData({
                'guidanceOrder.stopRefresh': true
            });
        });
        return this.guidanceRequest;
    },
    //设置状态文字的颜色
    setStatusColor(order, type) {
        if (type == 'mall') {
            switch (order.status) {
                case 0:
                case 5:
                case 6:
                    order.statusColor = 'danger-color';
                    break;
                case 1:
                case 7:
                case 8:
                    order.statusColor = 'success-color';
                    break;
            }
        }
    },
    loadScreenList(refresh) {
        if (refresh) {
            this.data.screen.request && this.data.screen.request.requestTask.abort();
        } else if (this.data.screen.loading || this.data.screen.totalPage > -1 && this.data.screen.page > this.data.screen.totalPage) {
            return;
        }
        this.data.screen.loading = true;
        this.data.screen.request = wx.jyApp.http({
            url: '/patient/filtrate/list/v2',
            data: {
                doctorId: this.doctorId,
                page: refresh ? 1 : this.data.screen.page,
                limit: 20,
            }
        });
        this.data.screen.request.then((data) => {
            if (refresh) {
                this.setData({
                    'screen.page': 1,
                    'screen.totalPage': -1,
                    'screen.list': []
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                item._filtrateType = item.filtrateType;
                item._filtrateResult = item.filtrateResult;
                item.resultDescription = item.resultDescription && item.resultDescription.split(';') || [];
                if (item.filtrateType == 'PG-SGA') {
                    if (item.answers) {
                        try {
                            item.answers = JSON.parse(item.answers);
                            this.setPgsgaResult(item.answers, item.resultDescription);
                        } catch (e) {}
                    }
                }
                if (item.filtrateType == 'FAT') {
                    item._filtrateType = '超重与肥胖';
                    if (item.filtrateResult == 1) {
                        item._filtrateResult = '体重正常';
                    }
                    if (item.filtrateResult == 2) {
                        item._filtrateResult = '超重';
                    }
                    if (item.filtrateResult == 3) {
                        item._filtrateResult = '肥胖';
                    }
                    if (item.filtrateResult == 4) {
                        item._filtrateResult = '中心性肥胖（BMI超重）';
                    }
                    if (item.filtrateResult == 5) {
                        item._filtrateResult = '中心性肥胖（BMI肥胖）';
                    }
                }
                if (item.filtrateType == 'FAT-GROW') {
                    item._filtrateType = '出生、喂养史、发育史';
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-HOME') {
                    item._filtrateType = '家族史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-DISEASE') {
                    item._filtrateType = '疾病史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-TREAT') {
                    item._filtrateType = '肥胖治疗史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-DIET') {
                    item._filtrateType = '膳食调查'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-SIT') {
                    item._filtrateType = '久坐行为调查'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-SLEEP') {
                    item._filtrateType = '睡眠评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-ACTION') {
                    item._filtrateType = '身体活动水平评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-BODY') {
                    item._filtrateType = '体脂肪含量测量'
                    item.label = '评估';
                }
                if (item.filtrateType == 'TUNOUR_FLUID') {
                    item._filtrateType = '肿瘤恶液质评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'ORAL_MUCOSA') {
                    item._filtrateType = '口腔黏膜风险评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'X_INJURY') {
                    item._filtrateType = '放射性损伤评估'
                    item.label = '评估';
                }
            });
            this.data.screen.list = this.data.screen.list.concat(data.page.list);
            this.setData({
                'screen.list': this.data.screen.list,
                'screen.page': this.data.screen.page + 1,
                'screen.totalPage': data.page.totalPage,
            });
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.data.screen.loading = false;
            this.data.screen.request = null;
            this.setData({
                'screen.stopRefresh': true
            });
        });
    },
    setPgsgaResult(pgsga, resultDescription) {
        if (pgsga.dieteticChange) {
            var arr = [];
            var index = pgsga.dieteticChange.indexOf('NORMAL_FEED');
            if (index > -1) {
                arr.push('比正常量少的一般食物');
            }
            index = pgsga.dieteticChange.indexOf('SOLID_FEED');
            if (index > -1) {
                arr.push('一点固体食物');
            }
            index = pgsga.dieteticChange.indexOf('FLUID_FEED');
            if (index > -1) {
                arr.push('只有流质饮食');
            }
            index = pgsga.dieteticChange.indexOf('ONLY_NUTRITION');
            if (index > -1) {
                arr.push('只有营养补充品');
            }
            index = pgsga.dieteticChange.indexOf('LITTLE_FEED');
            if (index > -1) {
                arr.push('非常少的任何食物');
            }
            index = pgsga.dieteticChange.indexOf('INJECTABLE_FEED');
            if (index > -1) {
                arr.push('通过管饲进食或由静脉注射营养');
            }
            if (arr.length) {
                resultDescription.push('我现在只吃：' + arr.join('、'));
            }
        }
        if (pgsga.symptom) {
            var arr = [];
            var index = pgsga.symptom.indexOf('恶心');
            if (index > -1) {
                arr.push('恶心');
            }
            index = pgsga.symptom.indexOf('呕吐');
            if (index > -1) {
                arr.push('呕吐');
            }
            index = pgsga.symptom.indexOf('便秘');
            if (index > -1) {
                arr.push('便秘');
            }
            index = pgsga.symptom.indexOf('腹泻');
            if (index > -1) {
                arr.push('腹泻');
            }
            index = pgsga.symptom.indexOf('口腔溃疡');
            if (index > -1) {
                arr.push('口腔溃疡');
            }
            index = pgsga.symptom.indexOf('吞咽困难');
            if (index > -1) {
                arr.push('吞咽困难');
            }
            if (arr.length) {
                resultDescription.push('症状：' + arr.join('、'));
            }
        }
        if (pgsga.edemaOfAbdominal > 0) {
            var str = '';
            switch (Number(pgsga.edemaOfAbdominal)) {
                case 1:
                    str = '轻度异常';
                    break;
                case 2:
                    str = '中度异常';
                    break;
                case 3:
                    str = '严重异常';
                    break;
            }
            resultDescription.push('腹水：' + str);
        }
    }
})