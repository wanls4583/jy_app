Page({
    data: {

    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
    },
    onShow() {
        if (this.data.userInfo.role == 'DOCTOR') {
            wx.setNavigationBarTitle({
                title: '患者管理'
            });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '商城'
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#2aafff'
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    }
})