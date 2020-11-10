/*
 * @Author: lisong
 * @Date: 2020-11-10 16:46:03
 * @Description: 
 */
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
        },
        minDate: new Date(1900, 0, 1).getTime(),
        maxDate: new Date().getTime(),
        sexVisible: false,
        birthDayVisible: false,
        birthday: new Date().getTime()
    },
    onLoad(option) {
        this.doctorId = option.doctorId;
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
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
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/patientdocument/save`,
            method: 'post',
            data: this.data.patient
        }).then((data) => {
            return wx.jyApp.http({
                url: `/consultorder/simple/save`,
                method: 'post',
                data: {
                    patientId: data.id,
                    doctorId: this.doctorId
                }
            }).then((data) => {
                wx.navigateTo({
                    url: '/pages/interrogation/chat/index?id=' + data.id
                });
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})