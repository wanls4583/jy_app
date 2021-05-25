import area from '../../../data/area.js';
const app = getApp()

Page({
    data: {
        contact: {
            name: '',
            phone: '',
            provinceCity: '',
            cityCode: '',
            address: ''
        },
        areaVisible: false
    },
    onLoad(option) {
        this.setData({
            areaList: area
        });
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
    },
    onShowArea() {
        this.setData({
            areaVisible: !this.data.areaVisible
        });
    },
    onConfirmArea(e) {
        var arr = e.detail.values;
        var cityCode = arr[arr.length - 1].code;
        var area = '';
        arr.map((item) => {
            area += item.name;
        });
        this.setData({
            areaVisible: false,
            'contact.cityCode': cityCode,
            'contact.provinceCity': area
        });
    },
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.cityCode);
        this.setData({
            areaVisible: false
        });
    },
    onSave() {
        if (!this.data.contact.name) {
            wx.jyApp.toast('请填写联系人');
            return;
        }
        if (!/1\d{10}/.test(this.data.contact.phone)) {
            wx.jyApp.toast('请填写手机号');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        // wx.jyApp.http({
        //     url: `/patientdocument/${this.data.patient.id ? 'update' : 'save'}`,
        //     method: 'post',
        //     data: this.data.patient
        // }).then((data) => {
        //     wx.hideLoading();
        //     wx.jyApp.toastBack('保存成功');
        // }).catch(() => {
        //     wx.hideLoading();
        // });
    },
})