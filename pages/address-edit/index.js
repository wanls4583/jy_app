import area from '../../data/area.js';
const app = getApp()

Page({
    data: {
        address: {
            contactName: '',
            phone: '',
            provinceCity: '',
            code: '',
            address: '',
            isDefault: false
        },
        areaList: null,
        areaVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['selectAddress'],
            actions: ['updateSelectAddress'],
        });
        if (option && option.id) {
            wx.setNavigationBarTitle({
                title: '编辑地址'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '新增地址'
            });
        }
        this.setData({
            areaList: area
        });
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`address.${prop}`]: e.detail
        });
    },
    onShowArea() {
        this.setData({
            areaVisible: !this.data.areaVisible
        });
    },
    onConfirmArea(e) {
        var arr = e.detail.values;
        var code = arr[arr.length - 1].code;
        var area = '';
        arr.map((item) => {
            area += item.name;
        });
        this.setData({
            areaVisible: false,
            'address.code': code,
            'address.provinceCity': area
        });
    },
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.address.code);
        this.setData({
            areaVisible: false
        });
    },
    onSwitchChange(e) {
        this.setData({
            'address.isDefault': e.detail.value
        });
    },
    onSave() {
        if (!this.data.address.contactName || !this.data.address.phone || !this.data.address.provinceCity || !this.data.address.address) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none'
            });
            return;
        }
        if (!/^1[0-9]{10}$/.test(this.data.address.phone)) {
            wx.showToast({
                title: '请填写正确的手机号',
                icon: 'none'
            });
            return;
        }
        wx.jyApp.http({
            url: '/user/address/save',
            method: 'post',
            data: this.data.address
        }).then(() => {
            wx.showToast({
                title: '添加成功'
            });
            if (this.data.address.isDefault && !this.data.selectAddress) {
                this.updateSelectAddress(this.data.address);
            }
            wx.navigateBack();
        });
    },
    loadInfo() {
        
    }
})