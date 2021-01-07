/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filterDate: new Date().getTime(),
        pgsga: {
            filterDate: new Date().formatTime('yyyy-MM-dd'),
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
            integralEvaluation: null,
        },
        dateVisible: false,
        step: 1
    },
    onLoad(option) {
        if (!option.id) {
            var patient = wx.jyApp.getTempData('screenPatient') || {};
            patient._sex = patient.sex == 1 ? '男' : '女';
            this.setData({
                filtrateByName: option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
                'pgsga.filtrateId': option.filtrateId,
                'pgsga.currentStature': patient.height,
                'pgsga.currentWeight': patient.weight,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id);
        }
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
    onShowDate() {
        this.setData({
            dateVisible: true
        });
    },
    onConfirmDate(e) {
        var filterDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'pgsga.filterDate': filterDate,
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
            BMI = BMI && BMI.toFixed(2) || '';
            return BMI || '';
        }
    },
    //计算总分
    countScore() {

        function _getRealNum(num) {
            return Number(num > 0 ? num : 0);
        }
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/filtrate/pgsga/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtratePgsga = data.filtratePgsga || {};
            data.filtratePgsga.symptom = data.filtratePgsga.symptom && data.filtratePgsga.symptom.split(',') || [];
            data.filtratePgsga.dieteticChange = data.filtratePgsga.dieteticChange && data.filtratePgsga.dieteticChange.split(',') || [];
            this.setData({
                pgsga: data.filtratePgsga,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
        });
    },
    onSave() {
        var data = {
            ...this.data.pgsga
        };
        data.symptom = data.symptom.join(',');
        data.dieteticChange = data.dieteticChange.join(',');
        wx.jyApp.http({
            url: '/filtrate/pgsga/save',
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功');
        });
    }
})