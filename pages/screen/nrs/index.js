/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        nrs: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            bmiLessThan: '',
            stature: '',
            weight: '',
            BMI: '',
            loseWeight: null,
            foodIntake: null,
            needNormal: null,
            needAddition: null,
            ageGe70: 0,
            result: 0,
            resultDescription: '',
        },
        dateVisible: false
    },
    onLoad(option) {
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        // 患者通过医生详情下的筛查按钮进入
        this.doctorId = option.doctorId;
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                filtrateByName: this.doctorId ? patient.patientName : option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'nrs.stature': patient.height,
                'nrs.weight': patient.weight,
                'nrs.ageGe70': patient.age >= 70 ? 1 : 0,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.nrs.id) {
                    this.setData({
                        filtrateByName: option.filtrateByName,
                        'nrs.stature': patient.height,
                        'nrs.weight': patient.weight,
                        'nrs.ageGe70': patient.age >= 70 ? 1 : 0,
                    });
                    this.setBMI();
                    this.countScore();
                }
            });
        }
        this.setData({
            'nrs.filtrateId': option.filtrateId,
            'consultOrderId': option.consultOrderId,
            'filtrateType': option.filtrateType,
        });
    },
    onUnload() {},
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
        this.setBMI();
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
        var result = [this.data.nrs.bmiLessThan, this.data.nrs.loseWeight, this.data.nrs.foodIntake].sort(function (a, b) {
            return a - b
        })[2];
        result = _getRealNum(result) + _getRealNum(this.data.nrs.needNormal) + _getRealNum(this.data.nrs.ageGe70);
        if (!_getRealNum(this.data.nrs.needNormal)) {
            result += _getRealNum(this.data.nrs.needAddition);
        }
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
            url: `/filtrate/nrs/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateNrs = data.filtrateNrs || this.data.nrs;
            data.filtrateNrs.filtrateDate = data.patientFiltrate.filtrateDate;
            this.setData({
                nrs: data.filtrateNrs,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
        });
    },
    onSave() {
        var data = {
            ...this.data.nrs
        };
        wx.jyApp.showLoading('加载中...', true);
        if (!this.doctorId) {
            if (!data.filtrateId) {
                wx.jyApp.http({
                    url: '/patient/filtrate/save',
                    method: 'post',
                    data: {
                        consultOrderId: this.data.consultOrderId,
                        filtrateType: this.data.filtrateType,
                        isSelf: true,
                    }
                }).then((_data) => {
                    data.filtrateId = _data.filtrateId;
                    _save.bind(this)();
                }).catch(() => {
                    wx.hideLoading();
                });
            } else {
                _save.bind(this)();
            }
        } else {
            data.patientId = this.patient.id;
            data.doctorId = this.doctorId;
            wx.jyApp.http({
                url: `/filtrate/nrs/public/save`,
                method: 'post',
                data: data
            }).then(() => {
                wx.jyApp.toastBack('保存成功');
            }).finally(() => {
                wx.hideLoading();
            });
        }

        function _save() {
            wx.jyApp.http({
                url: `/filtrate/nrs/${this.data.nrs.id?'update':'save'}`,
                method: 'post',
                data: data
            }).then(() => {
                var page = wx.jyApp.utils.getPageByLastIndex(2);
                if (page.route == 'pages/screen/screen-list/index') {
                    page.onRefresh();
                }
                wx.jyApp.toastBack('保存成功');
            }).finally(() => {
                wx.hideLoading();
            });
        }
    }
})