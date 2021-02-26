Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    properties: {
        patient: {
            type: Object,
            value: {}
        },
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                if (newVal) {
                    wx.nextTick(() => {
                        this.loadInfo();
                    });
                }
            }
        }
    },
    data: {
        filtrateDate: new Date().getTime(),
        nrs: {
            id: '',
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            bmiLessThan: '',
            stature: '',
            weight: '',
            BMI: '',
            loseWeight: null,
            foodIntake: null,
            needNormal: null,
            ageGe70: 0,
            result: 0,
            resultDescription: '',
        },
        dateVisible: false,
        doctorName: ''
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function () {
        this._attached();
    },
    methods: {
        _attached() {
            var userInfo = wx.getStorageSync('mobileUserInfo');
            this.setData({
                'doctorName': userInfo.name
            });
        },
        onInput(e) {
            wx.jyApp.utils.onInput(e, this);
            this.setBMI();
            this.countScore();
        },
        onShowDate() {
            this.setData({
                dateVisible: true
            });
        },
        onConfirmDate(e) {
            var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
            this.setData({
                'nrs.filtrateDate': filtrateDate,
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
            if (this.data.nrs.stature && this.data.nrs.weight) {
                var BMI = _getBMI(this.data.nrs.stature, this.data.nrs.weight)
                this.setData({
                    'nrs.BMI': BMI,
                    'nrs.bmiLessThan': BMI < 18.5 ? 3 : 0
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
            var result = [this.data.nrs.bmiLessThan, this.data.nrs.loseWeight, this.data.nrs.foodIntake].sort(function (a, b) {
                return a - b
            })[2];
            result = _getRealNum(result) + _getRealNum(this.data.nrs.needNormal) + _getRealNum(this.data.nrs.ageGe70);
            this.setData({
                'nrs.result': result,
                'nrs.resultDescription': result >= 3 ? '患者有营养风险，需进行营养支持治疗' : '建议每周重新评估患者的营养状况'
            });

            function _getRealNum(num) {
                return Number(num > 0 ? num : 0);
            }
        },
        loadInfo(id) {
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'nrs',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient
                }
            }).then((data) => {
                data = data.result.rows[0];
                this.setInfo(data);
            });
        },
        //数据转换(兼容营养系统)
        setInfo(nrs) {
            if (!nrs) {
                return;
            }
            var data = {
                filtrateDate: nrs.filtratedDate && new Date(nrs.filtratedDate).formatTime('yyyy-MM-dd') || '',
                bmiLessThan: nrs.bmiLessThan ? 3 : 0,
                stature: nrs.stature,
                weight: nrs.weight,
                BMI: nrs.bmi,
                loseWeight: null,
                foodIntake: null,
                needNormal: null,
                ageGe70: nrs.ageGe70 ? 1 : 0,
                result: nrs.score,
                resultDescription: nrs.handle,
            }
            if (nrs.foodIntake) {
                data.foodIntake = 0;
            } else if (nrs.foodIntake1) {
                data.foodIntake = 1;
            } else if (nrs.foodIntake2) {
                data.foodIntake = 2;
            } else if (nrs.foodIntake3) {
                data.foodIntake = 3;
            }
            if (nrs.normalNutrition) {
                data.loseWeight = 0
            } else if (nrs.loseWeightOrFoodIntake1) {
                data.loseWeight = 1;
            } else if (nrs.loseWeightOrFoodIntake2) {
                data.loseWeight = 2;
            } else if (nrs.loseWeightOrFoodIntake3) {
                data.loseWeight = 3;
            }
            if (nrs.needNormal) {
                data.needNormal = 0;
            } else if (nrs.needSlightlyIncrease) {
                data.needNormal = 1;
            } else if (nrs.needModeratelyIncrease) {
                data.needNormal = 2;
            } else if (nrs.needSlightlyIncrease) {
                data.needNormal = 3;
            }
            this.setData({
                nrs: data,
                filtrateDate: nrs.filtrateDate,
                doctorName: nrs.doctorName
            });
        },
        //数据转换(兼容营养系统)
        getSaveData() {
            var data = {
                ...this.data.nrs,
                inHospitalNumber: this.properties.patient.inHospitalNumber,
                isInpatient: this.properties.patient.isInpatient
            };
            data.bmi = data.BMI;
            data.bmiLessThan = data.bmiLessThan == 3 ? true : false;
            data.ageGe70 = data.ageGe70 == 1 ? true : false;
            data.score = data.result;
            data.handle = data.resultDescription;
            data.foodIntake = false;
            data.foodIntake1 = false;
            data.foodIntake2 = false;
            data.foodIntake3 = false;
            var foodIntake = data.foodIntake;
            switch (foodIntake) {
                case 0:
                    data.foodIntake = true;
                    break;
                case 1:
                    data.foodIntake1 = true;
                    break;
                case 2:
                    data.foodIntake2 = true;
                    break;
                case 3:
                    data.foodIntake3 = true;
                    break;
            }
            data.normalNutrition = false;
            data.loseWeightOrFoodIntake1 = false;
            data.loseWeightOrFoodIntake2 = false;
            data.loseWeightOrFoodIntake3 = false;
            switch (data.loseWeight) {
                case 0:
                    data.normalNutrition = true;
                    break;
                case 1:
                    data.loseWeightOrFoodIntake1 = true;
                    break;
                case 2:
                    data.loseWeightOrFoodIntake2 = true;
                    break;
                case 3:
                    data.loseWeightOrFoodIntake3 = true;
                    break;
            }
            var needNormal = data.needNormal;
            data.needNormal = false;
            data.needSlightlyIncrease = false;
            data.needModeratelyIncrease = false;
            data.needSlightlyIncrease = false;
            //疾病状况
            switch (needNormal) {
                case 0:
                    data.needNormal = true;
                    break;
                case 1:
                    data.needSlightlyIncrease = true;
                    break;
                case 2:
                    data.needModeratelyIncrease = true;
                    break;
                case 3:
                    data.needSlightlyIncrease = true;
                    break;
            }
            return data;
        },
        onSave() {
            var data = this.getSaveData();
            wx.jyApp.showLoading('加载中...', true);
            _save.bind(this)();

            function _save() {
                wx.jyApp.http({
                    type: 'mobile',
                    method: 'post',
                    url: '/app/nutrition/saveOrUpdate',
                    data: {
                        method: 'nrs',
                        params: JSON.stringify({
                            ...data
                        })
                    }
                }).then(() => {
                    wx.jyApp.toast('保存成功');
                }).finally(() => {
                    wx.hideLoading();
                });
            }
        }
    }
})