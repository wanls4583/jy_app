Page({
    data: {
        barcodeUrl: '',
        type: ''
    },
    onLoad(option) {},
    onUnload() {},
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    }
})