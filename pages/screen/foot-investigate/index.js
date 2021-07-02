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
        result: '',
        resultDescription: '',
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
        var patient = wx.jyApp.getTempData('screenPatient') || {};
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
            if (step == 24) {
                this.onSave();
            } else {
                this.setData({
                    step: step + 1
                });
            }
        }, 500);
    },
    countResult() {
        var score = 0;
        var resultDescription = [];
        this.data.answers.q.map((item, i) => {
            if (item !== undefined) {
                score += item;
                if (this.data.resultMap[i][item] && resultDescription.indexOf(this.data.resultMap[i][item]) == -1) {
                    resultDescription.push(this.data.resultMap[i][item]);
                }
            }
        });
        var result = '膳食营养无风险';
        if (score <= 75) {
            result = '膳食营养风险可疑';
        }
        if (score < 60) {
            result = '膳食营养有风险';
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';')
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
        this.countResult();
        var data = {
            id: this.data.id,
            patientId: this.data.patient.patientId || this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-DIET',
            result: this.data.result,
            resultDescription: this.data.resultDescription
        };
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/fatevaluate/${data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    if (this.data.result == '膳食营养风险可疑') {
                        result = 2;
                    }
                    if (this.data.result == '膳食营养有风险') {
                        result = 3
                    }
                    wx.jyApp.setTempData('food-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/food-result/index?result=${result}&_result=${this.data.result}`
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