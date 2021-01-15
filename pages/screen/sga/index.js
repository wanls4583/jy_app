/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        sga: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            weightLose: '',
            dietChange: '',
            stomachSymptom: '',
            activity: '',
            stressReaction: '',
            muscle: '',
            fatLose: '',
            edema: '',
            result: '',
        },
        dateVisible: false
    },
    onLoad(option) {
        if (!option.id) {
            var patient = wx.jyApp.getTempData('screenPatient') || {};
            patient._sex = patient.sex == 1 ? '男' : '女';
            this.setData({
                filtrateByName: option.filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id);
        }
        this.setData({
            'sga.filtrateId': option.filtrateId
        });
    },
    onUnload() {},
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
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
            'sga.filtrateDate': filtrateDate,
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
        var scoreMap = {
            'A': 0,
            'B': 0,
            'C': 0
        }
        var checkPass = true;
        var prop = ['weightLose', 'dietChange', 'stomachSymptom', 'activity', 'stressReaction', 'muscle', 'fatLose', 'edema'];
        var result = '';
        prop.map(item => {
            if (!this.data.sga[item]) {
                checkPass = false;
            }
        });
        if (!checkPass) {
            this.setData({
                'sga.result': ''
            });
            return;
        }
        prop.map(item => {
            scoreMap[this.data.sga[item]]++;
        });
        if (scoreMap['A'] >= 5) {
            result = 'A';
        } else if (scoreMap['C'] >= 5) {
            result = 'C';
        } else {
            result = 'B';
        }
        this.setData({
            'sga.result': result
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/filtrate/sga/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateSga = data.filtrateSga || this.data.sga;
            data.filtrateSga.filtrateDate = data.patientFiltrate.filtrateDate;
            this.setData({
                sga: data.filtrateSga,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
        });
    },
    onSave() {
        wx.jyApp.http({
            url: `/filtrate/sga/${this.data.sga.id?'update':'save'}`,
            method: 'post',
            data: {
                ...this.data.sga
            }
        }).then(() => {
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page.route == 'pages/screen/screen-list/index') {
                page.onRefresh();
            }
            wx.jyApp.toastBack('保存成功');
        });
    }
})