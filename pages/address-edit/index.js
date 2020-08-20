import area from '../../data/area.js';
const app = getApp()

Page({
    data: {
        address: {
            id: 0,
            contactName: '',
            phone: '',
            provinceCity: '',
            cityCode: '',
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
            this.loadInfo(option.id);
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
        var cityCode = arr[arr.length - 1].code;
        var area = '';
        arr.map((item) => {
            area += item.name;
        });
        this.setData({
            areaVisible: false,
            'address.cityCode': cityCode,
            'address.provinceCity': area
        });
    },
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.address.cityCode);
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
            url: `/user/address/${this.data.address.id?'update':'save'}`,
            method: 'post',
            data: this.data.address
        }).then(() => {
            if (this.data.address.isDefault && !this.data.selectAddress) {
                this.updateSelectAddress(this.data.address);
            }
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
            url: `/user/address/info/${id}`
        }).then((data) => {
            this.setData({
                address: data.userAddress
            });
        });
    }
})