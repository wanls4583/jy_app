Page({
    data: {
        doctor: {}
    },
    onLoad(option) {
        this.id = option.id;
        this.getDoctorInfo();
    },
    getDoctorInfo() {
        wx.jyApp.http({
            url: '/doctor/info/' + this.id
        }).then((data) => {
            this.setData({
                doctor: data.doctor
            });
        });
    },
    onClickConsult() {
        wx.navigateTo({
            url: '/pages/interrogation/illness-edit/index?doctorId=' + this.id
        });
    }
})