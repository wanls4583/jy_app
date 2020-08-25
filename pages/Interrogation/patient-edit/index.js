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
            hegiht: '',
            weight: ''
        },
        minDate: new Date(1900, 0, 1),
        sexVisible: false,
        birthDayVisible: false,
        birthday: new Date().getTime()
    },
    onLoad(option) {
        if (option.id) {
            this.loadInfo(option.id);
        }
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`patient.${prop}`]: e.detail
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
        var birthday = wx.jyApp.utils.formatTime(e.detail, 'yyyy-MM-dd');
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
            url: `/patientdocument/${this.data.patient.id?'update':'save'}`,
            method: 'post',
            data: this.data.patient
        }).then(() => {
            wx.showToast({
                title: '操作成功',
                complete: () => {
                    wx.navigateBack();
                }
            });
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/patientdocument/info/${id}`
        }).then((data) => {
            this.setData({
                patient: data.patientdocument
            });
        });
    }
})