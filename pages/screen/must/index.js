/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        must: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            bmiScore: null,
            stature: '',
            weight: '',
            BMI: '',
            weightScore: '',
            diseaseScore: '',
            result: '',
        },
        dateVisible: false
    },
    onLoad(option) {
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                filtrateByName: option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'must.stature': patient.height,
                'must.weight': patient.weight,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.must.id) {
                    this.setData({
                        'must.stature': patient.height,
                        'must.weight': patient.weight,
                    });
                    this.setBMI();
                    this.countScore();
                }
            });
        }
        this.setData({
            'must.filtrateId': option.filtrateId
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
            'must.filtrateDate': filtrateDate,
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
        if (this.data.must.stature && this.data.must.weight) {
            var BMI = _getBMI(this.data.must.stature, this.data.must.weight)
            this.setData({
                'must.BMI': BMI,
                'must.bmiScore': BMI >= 20 ? 0 : (BMI <= 18.5 ? 2 : 1)
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
        var count = (Number(this.data.must.weightScore) || 0) + (Number(this.data.must.bmiScore) || 0) + (Number(this.data.must.diseaseScore) || 0);
        this.setData({
            'must.result': count + ''
        })
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/filtrate/must/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateMust = data.filtrateMust || this.data.must;
            data.filtrateMust.filtrateDate = data.patientFiltrate.filtrateDate;
            this.setData({
                must: data.filtrateMust,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
        });
    },
    onSave() {
        wx.jyApp.http({
            url: `/filtrate/must/${this.data.must.id?'update':'save'}`,
            method: 'post',
            data: {
                ...this.data.must
            }
        }).then(() => {
            wx.jyApp.toastBack('保存成功');
        });
    }
})