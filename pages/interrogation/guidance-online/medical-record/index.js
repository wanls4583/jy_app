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
        this.consultOrderId = option.id;
    },
    onUnload() {},
    onSave() {
        wx.jyApp.setTempData('guidanceData', {
            consultOrderId: this.consultOrderId
        });
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/guidance-online/guidance-diagnosis/index'
        });
    }
})