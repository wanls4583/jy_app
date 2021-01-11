/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        mna: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            step2Score: 0,
            stature: '',
            height: '',
            q1: null,
            q2: null,
            q3: null,
            q4: null,
            q5: null,
            q6: null,
            q7: null,
            q8: null,
            q9: null,
            q10: null,
            q111: null,
            q112: null,
            q113: null,
            q12: null,
            q13: null,
            q14: null,
            q15: null,
            q16: null,
            q17: null,
            q18: null,
            result: ''
        },
        dateVisible: false,
        step: 1,
    },
    onLoad(option) {
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                filtrateByName: option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'mna.stature': patient.height,
                'mna.weight': patient.weight,
            });
            this.setBMI();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.mna.id) {
                    this.setData({
                        'mna.stature': patient.height,
                        'mna.weight': patient.weight,
                    });
                    this.setBMI();
                }
            });;
        }
        this.setData({
            'mna.filtrateId': option.filtrateId
        });
    },
    onUnload() {},
    onNext() {
        if (this.data.step == 4) {
            return;
        }
        if (this.data.step == 2 && this.data.mna.step2Score == 1) {
            this.setData({
                step: 4
            });
        } else {
            this.setData({
                step: this.data.step + 1
            });
        }
    },
    onPre() {
        if (this.data.step == 1) {
            return;
        }
        if (this.data.step == 4 && this.data.mna.step2Score == 1) {
            this.setData({
                step: 2
            });
        } else {
            this.setData({
                step: this.data.step - 1
            });
        }
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
            'mna.filtrateDate': filtrateDate,
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
        if (this.data.mna.stature && this.data.mna.weight) {
            var BMI = _getBMI(this.data.mna.stature, this.data.mna.weight)
            this.setData({
                'mna.BMI': BMI
            });
        }
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
        var mna = this.data.mna;
        var count = 0;
        var result = '';
        var step2Score = 0;
        step2Score = _getNum(mna.q1) + _getNum(mna.q2) + _getNum(mna.q3) + _getNum(mna.q4) + _getNum(mna.q5) + _getNum(mna.q6);
        this.setData({
            'mna.step2Score': step2Score >= 12 ? 1 : 2
        });
        if (step2Score < 12) {
            count = step2Score;
            count += _getNum(mna.q7) + _getNum(mna.q8) + _getNum(mna.q9) + _getNum(mna.q10) + _getNum(mna.q12) + _getNum(mna.q13) + _getNum(mna.q14) + _getNum(mna.q15) + _getNum(mna.q16) + _getNum(mna.q17) + _getNum(mna.q18);
            var tempMap = {
                0: 0,
                1: 0
            }
            if (tempMap[mna.q111] != null) {
                tempMap[mna.q111]++;
            }
            if (tempMap[mna.q112] != null) {
                tempMap[mna.q112]++;
            }
            if (tempMap[mna.q113] != null) {
                tempMap[mna.q113]++;
            }
            if (tempMap[0] == 3) {
                this.setData({
                    'mna.q11Score': 2
                });
            } else if (tempMap[0] == 2) {
                this.setData({
                    'mna.q11Score': 1
                });
            } else if (tempMap[0] > 0 || tempMap[1] > 0) {
                this.setData({
                    'mna.q11Score': 0
                });
            }
            count += _getNum(mna.q11Score);
        } else {
            count = step2Score + 17;
        }

        if (count >= 24) {
            result = 'A';
        } else if (count > 17) {
            result = 'B';
        } else {
            result = 'C';
        }
        this.setData({
            'mna.result': count,
            'mna._result': result,
        });

        function _getNum(num) {
            return Number(num) || 0;
        }
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/filtrate/mna/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateMna = data.filtrateMna || this.data.mna;
            data.filtrateMna.filtrateDate = data.patientFiltrate.filtrateDate;
            this.setData({
                mna: data.filtrateMna,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
            data.filtrateMna.id && this.countScore();
        });
    },
    onSave() {
        var data = {
            ...this.data.mna
        };
        wx.jyApp.http({
            url: `/filtrate/mna/${data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功');
        });
    }
})