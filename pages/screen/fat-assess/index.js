/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {},
    onLoad(option) {
        this.setData({
            doctorId: option.doctorId || '',
            doctorName: option.doctorName || ''
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
})