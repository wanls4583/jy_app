/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        patientList: [],
    },
    onLoad(option) {
        this.getPatient();
        this.setData({
            doctorId: option.doctorId || '',
            doctorName: option.doctorName || '',
        });
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    getPatient() {
        wx.jyApp.http({
            url: '/patientdocument/list',
            data: {
                page: 1,
                limit: 1
            }
        }).then((data) => {
            this.setData({
                patientList: data.list || []
            });
        });
    },
})