/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description:
 */
Page({
    data: {
        step: 1,
        id: '',
        filtrateId: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            q: [],
            pgsga: {
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
            },
            selfDiet: 0,
            mainDiet: '',
        },
        result: '',
        resultDescription: '',
        filtrateDate: new Date().getTime(),
        dateVisible: false,
        weightChangeScoreMap: {
            NO_CHANGE: 0,
            MORE_THAN_BEFORE: 0,
            LESS_THAN_BEFORE: 1,
        },
        dieteticChangeScoreMap: {
            FEED_NORMAL: 0,
            NORMAL_FEED: 1,
            SOLID_FEED: 2,
            FLUID_FEED: 3,
            ONLY_NUTRITION: 3,
            LITTLE_FEED: 4,
            INJECTABLE_FEED: 0,
        },
        appetiteChangeScoreMap: {
            NO_CHANGE: 0,
            MORE: 0,
            LESS: 1,
        },
        symptomScoreMap: {
            没有饮食困难: 0,
            没有食欲: 3,
            恶心: 1,
            呕吐: 3,
            便秘: 1,
            腹泻: 3,
            口干: 1,
            吞咽困难: 2,
            何处疼痛: 3,
            食物有怪味或没有味道: 1,
            食物气味不好: 1,
            吃一会就饱了: 1,
        },
        physicalConditionScoreMap: {
            NORMAL: 0,
            DIFFERENT: 1,
            UNCOMFORTABLE: 2,
            LITTLE_MOTION: 3,
            IN_BED: 3,
        },
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.share = option.share || '';
        // 患者通过筛查选择页面进入
        this.from = option.from || '';
        this.roomId = option.roomId || '';
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                doctorName: option.doctorName,
                patient: patient,
                'answers.pgsga.currentStature': patient.height,
                'answers.pgsga.currentWeight': patient.weight,
                'answers.pgsga.ageScore': patient.age > 65 ? '1' : '0',
            });
        } else {
            this.loadInfo(option.id);
        }
        this.setData({
            filtrateId: option.filtrateId || '',
            consultOrderId: option.consultOrderId || '',
            patientId: option.patientId || '',
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onShowDate() {
        this.setData({
            // dateVisible: true,
        });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'answers.filtrateDate': filtrateDate,
            dateVisible: false,
        });
    },
    onCancelDate() {
        this.setData({
            dateVisible: false,
        });
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
        if (prop == 'mainDiet') {
            this.setData({
                'answers.selfDiet': 0,
            });
        }
    },
    onClickImg(e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            'answers.selfDiet': num,
        });
    },
    onPre() {
        this.setData({
            step: this.data.step - 1,
        });
    },
    onNext() {
        if (this.data.step == 1) {
            if (!this.data.answers.q[0] || !this.data.answers.q[1] || !this.data.answers.q[2] || !this.data.answers.q[3] || !this.data.answers.q[4]) {
                wx.jyApp.toast('必填项不能为空');
                return;
            }
        }
        if (this.data.step == 2) {
            if (!this.data.answers.pgsga.currentStature) {
                wx.jyApp.toast('必填项不能为空');
                return;
            }
        }
        if (this.data.step == 7) {
            if (!this.data.answers.mainDiet) {
                wx.jyApp.toast('必填项不能为空');
                return;
            }
        }
        this.setData({
            step: this.data.step + 1,
        });
    },
    countMpgsgaScore() {
        var self = this;
        var pgsga = this.data.answers.pgsga;
        var count = _countStep1() + _countStep2() + _countStep3() + _countStep4() + _countStep5();
        this.setData({
            'answers.pgsga.score': count,
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
            var count = self.data.appetiteChangeScoreMap[pgsga.appetiteChange] || 0;
            if (pgsga.appetiteChange == 'LESS') {
                //饮食中最大的分数计入总分
                pgsga.dieteticChange.map((item) => {
                    if (self.data.dieteticChangeScoreMap[item] > count) {
                        count = self.data.dieteticChangeScoreMap[item];
                    }
                });
            }
            return count;
        }

        function _countStep3() {
            var count = 0;
            pgsga.symptom.map((item) => {
                count += self.data.symptomScoreMap[item];
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
    countResult() {
        var result = '';
        var colorResult = 1;
        var resultDescription = '';
        var C = 0;
        this.countMpgsgaScore();
        if (this.data.answers.pgsga.score === 0) {
            //判断mpgsga
            result = '营养良好';
            resultDescription = '不需要进行营养干预';
        } else if (this.data.selfDiet <= 2) {
            //判断膳食自评表
            result = '需营养干预';
            resultDescription = '需医生会诊，并进行营养干预';
            colorResult = 3;
        } else if (this.data.answers.q[0] == 1) {
            //是否有严重肝肾功能受损
            result = '需营养干预';
            resultDescription = '需医生会诊，并进行营养干预';
            colorResult = 3;
        } else if (this.data.answers.q[1] == 1) {
            //是否心肺功能受损
            result = '需营养干预';
            resultDescription = '需医生会诊，并进行营养干预';
            colorResult = 3;
        } else if (Number(this.data.answers.pgsga.currentStature)) {
            let weight = this.data.answers.pgsga.currentStature - 105;
            let N = 30 * weight;
            let Z = 0;
            if (this.data.answers.q[3] == 1) {
                //为糖尿病
                N = 28 * weight;
            }
            switch (this.data.answers.selfDiet) {
                case '3':
                    Z = 750;
                    break;
                case '4':
                    Z = 1050;
                    break;
                case '5':
                    Z = 1350;
                    break;
            }
            if (Z + 600 < N * 0.7) {
                result = '需营养干预';
                resultDescription = '需医生会诊，并进行营养干预';
                colorResult = 3;
            } else {
                let B = N - Z;
                result = '需营养干预';
                resultDescription = '需医生会诊，并进行营养干预';
                colorResult = 2;
                C = B;
            }
        }
        this.setData({
            C: C,
            result: result,
            resultDescription: resultDescription,
            colorResult: colorResult,
            isRisk: result === '需营养干预',
        });
        this.setPlan();
    },
    setPlan() {
        let C = this.data.C;
        let plan1 = [];
        let plan2 = [];
        let that = this;
        _step1();
        this.plans = {
            plan1: plan1,
            plan2: plan2,
        };

        function _step1() {
            if (C <= 300) {
                plan1.push('0017');
            } else {
                _step2();
            }
        }

        function _step2() {
            if (that.data.answers.q[3] == 1) {
                _step3();
            } else {
                _step4();
            }
        }

        function _step3() {
            if (that.data.answers.q[4] == 1) {
                if (C <= 400) {
                    plan1.push('0001');
                } else if (C <= 500) {
                    plan1.push('0002');
                } else if (C <= 600) {
                    plan1.push('0003');
                } else {
                    plan1.push('0004');
                }
            } else {
                if (C <= 400) {
                    plan1.push('0005');
                } else if (C <= 500) {
                    plan1.push('0006');
                } else if (C <= 600) {
                    plan1.push('0007');
                } else {
                    plan1.push('0008');
                }
            }
            _step5();
        }

        function _step4() {
            let symptom = that.data.answers.pgsga.symptom;
            let symptomMap = {};
            symptom.map((item) => {
                symptomMap[item] = true;
            });
            if (symptomMap['恶心'] || symptomMap['呕吐'] || symptomMap['腹泻'] || symptomMap['腹胀'] || symptomMap['腹痛']) {
                if (C <= 400) {
                    plan1.push('0005');
                } else if (C <= 500) {
                    plan1.push('0006');
                } else if (C <= 600) {
                    plan1.push('0007');
                } else {
                    plan1.push('0008');
                }
            } else {
                if (C <= 400) {
                    plan1.push('0009');
                } else if (C <= 500) {
                    plan1.push('0010');
                } else if (C <= 600) {
                    plan1.push('0011');
                } else {
                    plan1.push('0012');
                }
            }
            _step5();
        }

        function _step5() {
            if (that.data.answers.q[2] == 1) {
                if (plan1.indexOf('0005') == -1 && plan1.indexOf('0006') == -1 && plan1.indexOf('0007') == -1 && plan1.indexOf('0008') == -1) {
                    if (C <= 400) {
                        plan2.push('0005');
                    } else if (C <= 500) {
                        plan2.push('0006');
                    } else if (C <= 600) {
                        plan2.push('0007');
                    } else {
                        plan2.push('0008');
                    }
                }
            } else {
                if (C <= 400) {
                    plan2.push('0013');
                } else if (C <= 500) {
                    plan2.push('0014');
                } else if (C <= 600) {
                    plan2.push('0015');
                } else {
                    plan2.push('0016');
                }
            }
        }
    },
    loadInfo(id) {
        return wx.jyApp
            .http({
                url: `/evaluate/common/info/${id}`,
            })
            .then((data) => {
                data.info = data.info || {};
                data.patientFiltrate = data.patientFiltrate || {};
                data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
                var filtrateId = data.patientFiltrate.id;
                data.patientFiltrate.id = data.patientFiltrate.patientId;
                this.setData({
                    id: data.info.id || '',
                    filtrateId: filtrateId,
                    patient: data.patientFiltrate,
                });
                if (data.info.answers) {
                    data.info.answers = JSON.parse(data.info.answers);
                    this.setData({
                        answers: data.info.answers,
                    });
                } else {
                    this.setData({
                        'answers.pgsga.currentStature': this.data.patient.height,
                        'answers.pgsga.currentWeight': this.data.patient.weight,
                        'answers.pgsga.ageScore': this.data.patient.age > 65 ? '1' : '0',
                    });
                }
                if (data.info.answers.filtrateDate) {
                    this.setData({
                        filtrateDate: Date.prototype.parseDate(data.info.answers.filtrateDate),
                    });
                }
            });
    },
    onSave() {
        if (!this.data.answers.selfDiet) {
            wx.jyApp.toast('必填项不能为空');
            return;
        }
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            doctorId: this.doctorId,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'ASSISTANT_TUMOUR',
        };
        wx.jyApp.showLoading('加载中...', true);
        if (this.from == 'screen') {
            this.save(data);
        } else {
            this.saveWithChat(data);
        }
    },
    save(data) {
        wx.jyApp
            .http({
                url: `/evaluate/common/${this.data.id ? 'update' : 'save'}`,
                method: 'post',
                data: data,
            })
            .then((_data) => {
                data.filtrateId = data.filtrateId || _data.filtrateId;
                wx.jyApp.toastBack('保存成功', {
                    mask: true,
                    delta: 1,
                    complete: () => {
                        wx.jyApp.setTempData('assistant-results', [this.data.resultDescription]);
                        wx.jyApp.setTempData('assistant-plans', this.plans);
                        wx.jyApp.setTempData('assistant-patient', this.patient);
                        wx.jyApp.utils.navigateTo({
                            url: `/pages/screen/assistant-result/index?title=精准营养小助手&result=${this.data.colorResult}&_result=${this.data.result}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}&from=${this.from}&doctorId=${this.doctorId}&consultOrderId=${this.data.consultOrderId}`,
                        });
                    },
                });
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    saveWithChat(data) {
        if (!data.filtrateId) {
            wx.jyApp
                .http({
                    url: `/patient/filtrate/save${this.data.patientId ? '/v2' : ''}`, //v2版接口使用patientId字段，v1版本使用consultOrderId字段
                    method: 'post',
                    data: {
                        consultOrderId: this.data.consultOrderId,
                        patientId: this.data.patientId,
                        filtrateType: 'ASSISTANT_TUMOUR',
                        isSelf: this.data.userInfo.role == 'DOCTOR',
                        roomId: this.roomId,
                    },
                })
                .then((_data) => {
                    data.filtrateId = _data.filtrateId;
                    this.save(data);
                })
                .catch(() => {
                    wx.hideLoading();
                });
        } else {
            this.save(data);
        }
    },
});
