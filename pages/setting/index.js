/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    }
})