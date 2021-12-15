/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        pgsga: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            currentWeight: '',
            currentStature: '',
            weightOneMouthAgo: '',
            weightSixMouthAgo: '',
            weightChange: '',
            dieteticChange: [],
            appetiteChange: '',
            symptom: [],
            wherePained: '',
            other: '',
            physicalCondition: '',
            ageScore: '',
            score: 0,
            result: 'A'
        },
        dateVisible: false,
        step: 1,
        weightChangeScoreMap: {
            'NO_CHANGE': 0,
            'MORE_THAN_BEFORE': 0,
            'LESS_THAN_BEFORE': 1,
        },
        dieteticChangeScoreMap: {
            'FEED_NORMAL': 0,
            'NORMAL_FEED': 1,
            'SOLID_FEED': 2,
            'FLUID_FEED': 3,
            'ONLY_NUTRITION': 3,
            'LITTLE_FEED': 4,
            'INJECTABLE_FEED': 0,
        },
        appetiteChangeScoreMap: {
            'NO_CHANGE': 0,
            'MORE': 0,
            'LESS': 1,
        },
        symptomScoreMap: {
            '没有饮食困难': 0,
            '没有食欲': 3,
            '恶心': 1,
            '呕吐': 3,
            '便秘': 1,
            '腹泻': 3,
            '口干': 1,
            '吞咽困难': 2,
            '何处疼痛': 2,
            '食物有怪味或没有味道': 1,
            '食物气味不好': 1,
            '吃一会就饱了': 1,
        },
        physicalConditionScoreMap: {
            'NORMAL': 0,
            'DIFFERENT': 1,
            'UNCOMFORTABLE': 2,
            'LITTLE_MOTION': 3,
            'IN_BED': 3,
        },
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        // 患者通过筛查选择页面进入
        this.from = option.from || '';
        this.roomId = option.roomId || '';
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                filtrateByName: this.from == 'screen' ? patient.patientName : option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'pgsga.currentStature': patient.height,
                'pgsga.currentWeight': patient.weight,
                'pgsga.ageScore': patient.age > 65 ? '1' : '0',
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.pgsga.id) {
                    this.setData({
                        filtrateByName: option.filtrateByName,
                        'pgsga.currentStature': patient.height,
                        'pgsga.currentWeight': patient.weight,
                    });
                    this.setBMI();
                    this.countScore();
                }
            });
        }
        this.setData({
            'filtrateId': option.filtrateId || '',
            'consultOrderId': option.consultOrderId || '',
            'patientId': option.patientId || '',
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onNext() {
        this.setData({
            step: this.data.step + 1
        });
    },
    onPre() {
        this.setData({
            step: this.data.step - 1
        });
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
        this.countScore();
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        this.countScore();
    },
    onShowDate() {
        // this.setData({
        //     dateVisible: true
        // });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'pgsga.filtrateDate': filtrateDate,
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
        this.setData({
            [`${prop}`]: e.detail,
        });
        this.countScore();
    },
    setBMI() {
        if (this.data.patient.height && this.data.patient.weight) {
            var BMI = _getBMI(this.data.patient.height, this.data.patient.weight)
            this.setData({
                'patient.BMI': BMI
            });
        }

        function _getBMI(stature, weight) {
            var BMI = (weight) / (stature * stature / 10000);
            BMI = BMI && BMI.toFixed(1) || '';
            return BMI || '';
        }
    },
    //计算总分
    countScore() {
        var self = this;
        var pgsga = this.data.pgsga;
        var count = _countStep1() + _countStep2() + _countStep3() + _countStep4() + _countStep5();
        var resultDescription = [];
        this.setData({
            'pgsga.score': count
        });
        this.setResult(count);
        if (pgsga.dieteticChange.length) {
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
                resultDescription.push('我目前进食：' + arr.join('、'));
            }
        }
        if (pgsga.symptom.length) {
            var arr = [];
            var index = pgsga.symptom.indexOf('没有饮食困难');
            if (index > -1) {
                arr.push('没有饮食困难');
            }
            index = pgsga.symptom.indexOf('没有食欲');
            if (index > -1) {
                arr.push('没有食欲');
            }
            index = pgsga.symptom.indexOf('恶心');
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
            index = pgsga.symptom.indexOf('口干');
            if (index > -1) {
                arr.push('口干');
            }
            index = pgsga.symptom.indexOf('吞咽困难');
            if (index > -1) {
                arr.push('吞咽困难');
            }
            index = pgsga.symptom.indexOf('食物有怪味或没有味道');
            if (index > -1) {
                arr.push('食物有怪味或没有味道');
            }
            index = pgsga.symptom.indexOf('食物气味不好');
            if (index > -1) {
                arr.push('食物气味不好');
            }
            index = pgsga.symptom.indexOf('吃一会就饱了');
            if (index > -1) {
                arr.push('吃一会就饱了');
            }
            if (arr.length) {
                resultDescription.push('症状：' + arr.join('、'));
            }
        }
        this.setData({
            resultDescription: resultDescription
        });

        function _countStep1() {
            var count = 0;
            var percent = 0;
            if (pgsga.currentWeight && pgsga.weightOneMouthAgo) {
                percent = (pgsga.weightOneMouthAgo - pgsga.currentWeight) / pgsga.weightOneMouthAgo;
                if (percent >= 0.1) {
                    count += 4;
                } else if (percent >= 0.05) {
                    count += 3;
                } else if (percent >= 0.03) {
                    count += 2;
                } else if (percent >= 0.02) {
                    count += 1;
                }
            } else if (pgsga.currentWeight && pgsga.weightSixMouthAgo) {
                percent = (pgsga.weightSixMouthAgo - pgsga.currentWeight) / pgsga.weightSixMouthAgo;
                if (percent >= 0.2) {
                    count += 4;
                } else if (percent >= 0.1) {
                    count += 3;
                } else if (percent >= 0.06) {
                    count += 2;
                } else if (percent >= 0.02) {
                    count += 1;
                }
            }
            return count + (self.data.weightChangeScoreMap[pgsga.weightChange] || 0);
        }

        function _countStep2() {
            var count = 0;
            //饮食中最大的分数计入总分
            pgsga.dieteticChange.map(item => {
                if (self.data.dieteticChangeScoreMap[item] > count) {
                    count = self.data.dieteticChangeScoreMap[item];
                }
            });
            if (count <= self.data.appetiteChangeScoreMap[pgsga.appetiteChange]) {
                count = self.data.appetiteChangeScoreMap[pgsga.appetiteChange];
            }
            return count;
        }

        function _countStep3() {
            var count = 0;
            pgsga.symptom.map(item => {
                count += self.data.symptomScoreMap[item]
            });
            return count;
        }

        function _countStep4() {
            return self.data.physicalConditionScoreMap[pgsga.physicalCondition] || 0;
        }

        function _countStep5() {
            return Number(pgsga.ageScore) || 0;
        }
    },
    setResult(score) {
        if (score == 0) {
            this.setData({
                'pgsga.result': 'A'
            });
        }
        if (score >= 1 && score <= 2) {
            this.setData({
                'pgsga.result': 'B'
            });
        }
        if (score >= 3 && score <= 6) {
            this.setData({
                'pgsga.result': 'C'
            });
        }
        if (score >= 7) {
            this.setData({
                'pgsga.result': 'D'
            });
        }
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/evaluate/common/info/${id}`,
        }).then((data) => {
            var filtrateId = data.patientFiltrate.id;
            data.info = data.info || {};
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            if (data.info.answers) {
                data.info.answers = JSON.parse(data.info.answers);
                this.setData({
                    pgsga: data.info.answers,
                    filtrateId: filtrateId,
                    patient: data.patientFiltrate,
                    filtrateByName: data.patientFiltrate.filtrateByName,
                    doctorName: data.patientFiltrate.doctorName,
                    resultDescription: data.info.resultDescription && data.info.resultDescription.split(';')
                });
            }
            this.setBMI();
            data.filtratePgsga.id && this.countScore();
        });
    },
    onSave() {
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.pgsga),
            result: this.data.pgsga.score,
            resultDescription: this.data.resultDescription && this.data.resultDescription.join(';'),
            isRisk: this.data.pgsga.score > 0,
            type: 'mPG-SGA'
        };
        wx.jyApp.showLoading('加载中...', true);
        if (this.from == 'screen') {
            this.save(data);
        } else {
            this.saveWithChat(data);
        }
    },
    // 普通筛查
    save(data) {
        wx.jyApp.http({
            url: `/evaluate/common/${this.data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 0;
                    var _result = '营养良好';
                    if (data.result == 'B') {
                        result = 1;
                        _result = '轻度营养不良';
                    }
                    if (data.result == 'C') {
                        result = 2;
                        _result = '中度营养不良';
                    }
                    if (data.result == 'D') {
                        result = 3;
                        _result = '重度营养不良';
                    }
                    if (this.data.userInfo.role != 'DOCTOR') {
                        wx.jyApp.setTempData('screen-results', this.data.resultDescription);
                        wx.jyApp.utils.navigateTo({
                            url: `/pages/screen/screen-result/index?result=${result}&_result=${_result}&doctorId=${this.doctorId}`
                        });
                    }
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    saveWithChat(data) {
        if (!data.filtrateId) {
            wx.jyApp.http({
                url: `/patient/filtrate/save${this.data.patientId?'/v2':''}`, //v2版接口使用patientId字段，v1版本使用consultOrderId字段
                method: 'post',
                data: {
                    consultOrderId: this.data.consultOrderId,
                    patientId: this.data.patientId,
                    filtrateType: 'mPG-SGA',
                    isSelf: true,
                    roomId: this.roomId
                }
            }).then((_data) => {
                data.filtrateId = _data.filtrateId;
                this.save(data);
            }).catch(() => {
                wx.hideLoading();
            });
        } else {
            this.save(data);
        }
    }
})