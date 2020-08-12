import area from '../../data/area.js';
const app = getApp()

Page({
    data: {
        address: {
            name: '姓名',
            phone: '13875260179',
            area: '',
            code: '',
            detail: '门牌号',
        },
        areaList: null,
        areaVisible: false
    },
    onLoad(option) {
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
    showArea() {
        this.setData({
            areaVisible: !this.data.areaVisible
        });
    },
    confirmArea(e) {
        var arr = e.detail.values;
        var code = arr[arr.length - 1].code;
        var area = '';
        arr.map((item) => {
            area += item.name;
        });
        this.setData({
            areaVisible: false,
            'address.code': code,
            'address.area': area
        });
    },
    cancelArea() {
        this.selectComponent('#area').reset(this.data.address.code);
        this.setData({
            areaVisible: false
        });
    }
})