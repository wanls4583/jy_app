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
            mainDeseasePeriod: '',
            otherMainDeseasePeriod: '',
            metabolismStatus: null,
            fatOfCheek: null,
            fatOfTriceps: null,
            fatOfRib: null,
            fatOfLack: null,
            muscleOfTempora: null,
            muscleOfCollarbone: null,
            muscleOfShoulder: null,
            muscleBewteenBones: null,
            muscleOfScapula: null,
            muscleOfThigh: null,
            muscleOfTotalGrade: null,
            edemaOfAnkle: null,
            edemaOfShin: null,
            edemaOfAbdominal: null,
            edemaOfTotalGrade: null,
            integralEvaluation: 'SGA_A',
            score: 0
        },
        dateVisible: false,
        step: 1,
        weightChangeScoreMap: {
            'NO_CHANGE': 0,
            'MORE_THAN_BEFORE': 0,
            'LESS_THAN_BEFORE': 1,
        },
        dieteticChangeScoreMap: {
            'NORMAL_FEED': 0,
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
            '恶心': 1,
            '呕吐': 3,
            '便秘': 1,
            '腹泻': 3,
            '痛': 2,
            '干': 1,
            '吞咽困难': 2,
            '容易饱胀': 1,
            '没有饮食方面的问题': 0,
            '没有食欲': 3,
            '有怪味困扰着我': 2,
            '吃起来感觉没有味道': 1,
            '何处疼痛': 3,
            '其他': 1,
        },
        physicalConditionScoreMap: {
            'NORMAL': 0,
            'DIFFERENT': 1,
            'UNCOMFORTABLE': 2,
            'LITTLE_MOTION': 3,
            'IN_BED': 3,
        },
        mainDeseasePeriodMap: {
            '1级': 1,
            '2级': 2,
            '3级': 3,
            '4级': 4,
        }
    },
    onLoad(option) {
        if (!option.id) {
            var patient = wx.jyApp.getTempData('screenPatient') || {};
            patient._sex = patient.sex == 1 ? '男' : '女';
            this.setData({
                filtrateByName: option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'pgsga.currentStature': patient.height,
                'pgsga.currentWeight': patient.weight,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id);
        }
        this.setData({
            'pgsga.filtrateId': option.filtrateId
        });
    },
    onUnload() {},
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
        if (prop == 'pgsga.mainDeseasePeriod') {
            this.setData({
                'pgsga.otherMainDeseasePeriod': this.data.mainDeseasePeriodMap[e.detail]
            });
        }
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
            BMI = BMI && BMI.toFixed(2) || '';
            return BMI || '';
        }
    },
    //计算总分
    countScore() {
        var self = this;
        var pgsga = this.data.pgsga;
        var count = _countStep1() + _countStep2() + _countStep3() + _countStep4() + _countStep6() + _countStep8();
        this.setData({
            'pgsga.score': count
        });
        this.setResult(count);

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
            return count + (self.data.appetiteChangeScoreMap[pgsga.appetiteChange] || 0);
        }

        function _countStep3() {
            return self.data.symptomScoreMap[pgsga.symptom] || 0;
        }

        function _countStep4() {
            return self.data.physicalConditionScoreMap[pgsga.physicalCondition] || 0;
        }

        function _countStep5() {
            return Number(pgsga.otherMainDeseasePeriod) || 0;
        }

        function _countStep6() {
            return Number(pgsga.metabolismStatus) || 0;
        }

        function _countStep8() {
            var muscleCount = [{
                score: 0,
                num: 0
            }, {
                score: 1,
                num: 0
            }, {
                score: 2,
                num: 0
            }, {
                score: 3,
                num: 0
            }];
            if (muscleCount[pgsga.muscleOfTempora]) {
                muscleCount[pgsga.muscleOfTempora].num++;
            }
            if (muscleCount[pgsga.muscleOfCollarbone]) {
                muscleCount[pgsga.muscleOfCollarbone].num++;
            }
            if (muscleCount[pgsga.muscleOfShoulder]) {
                muscleCount[pgsga.muscleOfShoulder].num++;
            }
            if (muscleCount[pgsga.muscleBewteenBones]) {
                muscleCount[pgsga.muscleBewteenBones].num++;
            }
            if (muscleCount[pgsga.muscleOfScapula]) {
                muscleCount[pgsga.muscleOfScapula].num++;
            }
            if (muscleCount[pgsga.muscleOfThigh]) {
                muscleCount[pgsga.muscleOfThigh].num++;
            }
            if (muscleCount[pgsga.muscleOfTotalGrade]) {
                muscleCount[pgsga.muscleOfTotalGrade].num++;
            }
            //肌肉评分中分数个数最多的分数计入总分
            muscleCount.sort((arg1, arg2) => {
                return arg1.num - arg2.num;
            });
            return muscleCount[3].score;
        }
    },
    setResult(score) {
        if (score >= 0 && score <= 3) {
            this.setData({
                'pgsga.integralEvaluation': 'SGA_A'
            });
        }
        if (score > 3 && score <= 8) {
            this.setData({
                'pgsga.integralEvaluation': 'SGA_B'
            });
        }
        if (score > 8) {
            this.setData({
                'pgsga.integralEvaluation': 'SGA_C'
            });
        }
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/filtrate/pgsga/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtratePgsga = data.filtratePgsga || this.data.pgsga;
            data.filtratePgsga.filtrateDate = data.patientFiltrate.filtrateDate;
            data.filtratePgsga.symptom = data.filtratePgsga.symptom && data.filtratePgsga.symptom.split(',') || [];
            data.filtratePgsga.dieteticChange = data.filtratePgsga.dieteticChange && data.filtratePgsga.dieteticChange.split(',') || [];
            this.setData({
                pgsga: data.filtratePgsga,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
            data.filtratePgsga.id && this.setResult(data.filtratePgsga.score || 0);
        });
    },
    onSave() {
        var data = {
            ...this.data.pgsga
        };
        data.symptom = data.symptom.join(',');
        data.dieteticChange = data.dieteticChange.join(',');
        wx.jyApp.http({
            url: `/filtrate/pgsga/${data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功');
        });
    }
})