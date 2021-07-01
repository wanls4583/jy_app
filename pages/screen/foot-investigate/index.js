/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        step: 1,
        id: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            q: [],
        },
        score: 0,
        result: [],
        filtrateDate: new Date().getTime(),
        dateVisible: false,
        resultMap: [{
            0: '粗粮类食物摄入不足，主食品种单一',
            1: '粗粮类食物摄入不足'
        }, {
            0: '粗粮类食物摄入不足，主食品种单一'
        }, {
            0: '粗粮类食物摄入不足，主食品种单一'
        }, {
            0: '禽肉类摄入量不足'
        }, {
            0: '海鲜类食物摄入严重不足',
            1: '海鲜类食物摄入不足'
        }, {
            0: '蔬菜摄入量严重不足',
            1: '蔬菜摄入种类单一'
        }, {
            0: '深色叶类蔬菜摄入量严重不足',
            2: '深色叶类蔬菜摄入量不足'
        }, {
            0: '蛋类摄入量严重不足',
            2: '蛋类摄入量不足'
        }, {
            0: '水果摄入严重不足',
            2: '水果摄入不足'
        }, {
            0: '水果摄入严重不足',
            2: '水果摄入不足'
        }, {
            0: '奶类及乳制品摄入频率严重不足',
            1: '奶类及乳制品摄入频率不足'
        }, {
            0: '奶类及乳制品摄入量不足'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '甜食摄入频率较高',
            0: '甜食摄入频率过高'
        }, {
            0: '含糖饮食摄入频率较高'
        }, {
            0: '含糖饮食摄入频率较高'
        }, {
            2: '低营养高能量饮食摄入量较高',
            0: '低营养高能量饮食摄入量过高'
        }, {
            0: '低营养高能量饮食摄入量过高'
        }, {
            0: '低营养高盐饮食摄入量过高'
        }, {
            0: '低营养高脂肪食物摄入频率过高'
        }, {
            0: '饱和脂肪酸摄入量过高'
        }, {
            0: '饱和脂肪酸摄入量过高'
        }]
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        // 患者通过筛查选择页面进入
        this.from = option.from;
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                doctorName: option.doctorName,
                patient: patient,
            });
        } else {
            this.loadInfo(option.id);
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
        this.setBMI();
    },
    onShowDate() {
        this.setData({
            dateVisible: true
        });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'answers.filtrateDate': filtrateDate,
            dateVisible: false
        });
    },
    onCancelDate() {
        this.setData({
            dateVisible: false
        });
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        var step = prop.slice('answers.q['.length);
        step = Number(step.slice(0, -1)) + 1;
        this.setData({
            [`${prop}`]: e.detail,
        });
        setTimeout(() => {
            this.setData({
                step: step + 1
            });
            if (step == 2) {
                this.onSave();
            }
        }, 500);
    },
    countScore() {
        var score = 0;
        var result = [];
        this.data.answers.q.map((item, i) => {
            if (item !== undefined) {
                score += item;
                if (this.data.resultMap[i][item] && result.indexOf(this.data.resultMap[i][item]) == -1) {
                    result.push(this.data.resultMap[i][item]);
                }
            }
        });
        this.setData({
            score: score,
            result: result
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/fatevaluate/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
            this.setData({
                id: data.fatEvaluate.id || '',
                answers: data.fatEvaluate.answers,
                patient: data.patientFiltrate
            });
            if (data.fatEvaluate.answers.filtrateDate) {
                this.setData({
                    filtrateDate: Date.prototype.parseDate(data.fatEvaluate.answers.filtrateDate)
                });
            }
        });
    },
    onSave() {
        this.countScore();
        var data = {
            id: this.data.id,
            patientId: this.patient.id,
            answers: this.data.answers,
            type: 'BIRTH-HISTORY',
            result: this.data.result
        };
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/fatevaluate/save`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    var _result = '膳食营养无风险';
                    if (this.data.score <= 75) {
                        result = 2;
                        _result = '膳食营养风险可疑';
                    }
                    if (this.data.score < 60) {
                        result = 3
                        _result = '膳食营养有风险';
                    }
                    wx.jyApp.setTempData('food-results', this.data.result);
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/food-result/index?result=${result}&_result=${_result}&from=${this.from}`
                    });
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    onBack() {
        this.setData({
            step: this.data.step - 1
        });
    }
})