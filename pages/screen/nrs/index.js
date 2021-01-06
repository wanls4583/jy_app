/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        createTime: new Date().getTime(),
        nrs: {
            createTime: new Date().formatTime('yyyy-MM-dd'),
            bmiLessThan: '',
            stature: '',
            weight: '',
            BMI: '',
            loseWeight: '',
            foodIntake: '',
            needNormal: '',
            ageGe70: '',
            score: '',
            result: '',
        },
        dateVisible: false
    },
    onLoad(option) {
        if (!option.id) {
            var patient = wx.jyApp.getTempData('screenPatient') || {};
            patient._sex = patient.sex == 1 ? '男' : '女';
            this.setData({
                'nrs.filtrateId': option.filtrateId,
                'nrs.filtrateByName': option.filtrateByName,
                'nrs.doctorName': option.doctorName,
                'nrs.stature': patient.height,
                'nrs.weight': patient.weight,
                'nrs.ageGe70': patient.age >= 70 ? 1 : 0,
                patient: patient,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id);
        }
    },
    onUnload() {},
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
        var createTime = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'nrs.createTime': createTime,
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
            var BMI = (this.data.nrs.weight) / (this.data.nrs.stature * this.data.nrs.stature / 10000);
            BMI = BMI && BMI.toFixed(2) || '';
            this.setData({
                'nrs.BMI': BMI,
                'nrs.bmiLessThan': BMI < 18.5 ? 3 : 0
            });
        }
    },
    //计算总分
    countScore() {
        var score = [this.data.nrs.bmiLessThan, this.data.nrs.loseWeight, this.data.nrs.foodIntake].sort(function (a, b) {
            return a - b
        })[2];
        score = Number(score) + Number(this.data.nrs.needNormal) + Number(this.data.nrs.ageGe70);
        this.setData({
            'nrs.score': score,
            'nrs.result': score >= 3 ? '患者有营养风险，需进行营养支持治疗' : '建议每周重新评估患者的营养状况'
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/filtrate/nrs/info/${id}`,
        }).then((data) => {
            this.setData({
                nrs: data.filtrateNrs
            });
            this.setBMI();
        });
    },
    onSave() {
        wx.jyApp.http({
            url: '/filtrate/nrs/save',
            method: 'post',
            data: {
                ...this.data.nrs
            }
        }).then(() => {
            wx.jyApp.toastBack('保存成功');
        });
    }
})