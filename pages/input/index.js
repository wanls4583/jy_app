Page({
    data: {
        value: ''
    },
    onLoad(option) {
        this.setData({
            type: wx.jyApp.inputParam.type || 'text',
            value: wx.jyApp.inputParam.defaultValue || ''
        });
        wx.setNavigationBarTitle({
            title: wx.jyApp.inputParam.title || ''
        });
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onSave(e) {
        wx.jyApp.inputParam.complete(this.data.value);
        wx.jyApp.inputParam = null;
        wx.navigateBack();
    }
})