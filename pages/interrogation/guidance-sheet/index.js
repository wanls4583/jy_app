/*
 * @Author: lisong
 * @Date: 2021-01-05 09:18:30
 * @Description: 
 */
Page({
    data: {
        order: {}
    },
    onLoad(option) {
        var order = wx.jyApp.getTempData('guidanceSheetData');
        this.setData({
            order: order
        });
    },
    onUnload() {},
})