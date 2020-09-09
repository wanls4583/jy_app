Page({
    data: {
        barcode: '',
        tipVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.doctorId = option.doctorId;
        this.getQrCode();
        if (!this.data.userInfo) {
            this.setData({
                tipVisible: true
            });
        }
    },
    onShareAppMessage: function(res) {
        return {
            title: '医生邀请',
            path: '/pages/interrogation/qrcode-share/index?doctorId=' + this.doctorId
        }
    },
    //保存二维码
    onSave() {

    },
    getQrCode() {
        wx.jyApp.http({
            url: '/wx/share/barcode',
            data: {
                page: '/page/index/index',
                scene: 'type=invite&doctorId=' + this.doctorId
            }
        }).then((data) => {
            this.setData({
                barcode: data.barcode
            })
        });
    }
})