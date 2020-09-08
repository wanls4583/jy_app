Page({
    data: {
        barcode: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
        this.getQrCode();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //分享
    onShare() {

    },
    //保存二维码
    onSave() {

    },
    getQrCode() {
        wx.jyApp.http({
            url: '/wx/share/barcode',
            data: {
                page: '/page/index/index',
                scene: 'type=invite&doctorId=' + this.data.userInfo.id
            }
        }).then((data) => {
            this.setData({
                barcode: data.barcode
            })
        });
    }
})