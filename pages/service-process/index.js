/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        active: 0
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            from: 'home',
            active: Number(option.active) || 0 
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onClickHome() {
        wx.reLaunch({
            url: '/pages/index/index'
        });
    }
})