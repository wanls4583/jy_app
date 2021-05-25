Page({
    data: {
        barcodeUrl: '',
        type: '',
        typeMap: {}
    },
    onLoad(option) {},
    onShow() {
        this.loadTypeMap();
    },
    onUnload() {},
    onReceive(e) {
        var type = e.currentTarget.dataset.type;
        var url = e.currentTarget.dataset.url;
        if (this.data.typeMap[type] != -1) {
            wx.jyApp.toast('30天内只允许领取一次');
            return;
        }
        wx.jyApp.utils.navigateTo({
            url: url
        });
    },
    loadTypeMap() {
        wx.jyApp.http({
            url: '/doctorapplybarcode/list'
        }).then((data) => {
            this.setData({
                typeMap: data.map || {}
            });
        });
    }
})