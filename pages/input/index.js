/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
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
    onUnload() {
        wx.jyApp.inputParam = null;
    },
    onInput(e) {
        if(this.data.type == 'int') {
            wx.jyApp.utils.onInputNum(e, this, 0);
        } else if (this.data.type == 'number') {
            wx.jyApp.utils.onInputNum(e, this);
        } else {
            wx.jyApp.utils.onInput(e, this);
        }
    },
    onSave(e) {
        wx.jyApp.inputParam.complete(this.data.value);
        wx.jyApp.inputParam = null;
        wx.navigateBack();
    },
    onCancel() {
        wx.jyApp.inputParam = null;
        wx.navigateBack();
    }
})