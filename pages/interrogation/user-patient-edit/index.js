import area from '../../../data/area.js';
const app = getApp()

Page({
    data: {
        patient: {
            id: '',
            patientName: '',
            _sex: '',
            sex: '',
            birthday: '',
            height: '',
            weight: '',
            BMI: '',
            foodSensitive: ''
        },
        minDate: new Date(1900, 0, 1).getTime(),
        maxDate: new Date().getTime(),
        sexVisible: false,
        birthDayVisible: false,
        birthday: new Date().getTime()
    },
    onLoad(option) {
        if (option.id) {
            this.loadInfo(option.id);
            wx.setNavigationBarTitle({
                title: '编辑患者'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '添加患者'
            });
        }
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        var BMI = (this.data.patient.weight) / (this.data.patient.height * this.data.patient.height / 10000);
        this.setData({
            'patient.BMI': BMI && BMI.toFixed(2) || ''
        });
    },
    onShowBirthday() {
        this.setData({
            birthDayVisible: true
        });
    },
    onShowSex() {
        this.setData({
            sexVisible: true
        });
    },
    onConfirmSex(e) {
        this.setData({
            'patient.sex': e.detail.index,
            'patient._sex': e.detail.value,
            sexVisible: false
        });
    },
    onConfirmBirthday(e) {
        var birthday = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'patient.birthday': birthday,
            birthDayVisible: false
        });
    },
    onCancel() {
        this.setData({
            birthDayVisible: false,
            sexVisible: false
        });
    },
    onSave() {
        wx.jyApp.http({
            url: `/patientdocument/${this.data.patient.id ? 'update' : 'save'}`,
            method: 'post',
            data: this.data.patient
        }).then((data) => {
            var page = wx.jyApp.utils.getPages('pages/interrogation/user-patient-list/index');
            if(page) {
                page.loadList().then(()=>{
                    page.setData({
                        selectId: this.data.patient.id || data.id
                    });
                });
            }
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({
                    title: '操作成功'
                });
            }, 500);
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/patientdocument/info/${id}`
        }).then((data) => {
            var patient = data.patientDocument;
            patient._sex = patient.sex == 1 ? '男' : '女';
            patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
            patient.BMI = patient.BMI && patient.BMI.toFixed(2) || '';
            this.data.birthday = Date.prototype.parseDate(patient.birthday).getTime();
            this.setData({
                patient: patient,
                birthday: this.data.birthday
            });
        });
    }
})