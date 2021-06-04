import area from '../../../data/area.js';
const app = getApp()

Page({
    data: {
        contact: {
            contactName: '',
            contactPhone: '',
            provinceCity: '',
            cityCode: '',
            address: ''
        },
        areaVisible: false
    },
    onLoad(option) {
        this.type = option.type;
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
        if (!this.data.contact.contactName) {
            wx.jyApp.toast('请填写联系人');
            return;
        }
        if (!/1\d{10}/.test(this.data.contact.contactPhone)) {
            wx.jyApp.toast('手机号格式不正确');
            return;
        }
        if (!this.data.contact.cityCode) {
            wx.jyApp.toast('请选择地区');
            return;
        }
        if (!this.data.contact.address) {
            wx.jyApp.toast('请填写详细地址');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/doctorapplybarcode/save`,
            method: 'post',
            data: {
                ...this.data.contact,
                type: this.type,
            }
        }).then((data) => {
            wx.jyApp.toastBack('保存成功');
        }).catch(() => {
            wx.hideLoading();
        });
    },
})