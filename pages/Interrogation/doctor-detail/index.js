Page({
    data: {
        doctor: {},
        appraiseNum: 0,
        appraiseList: []
    },
    onLoad(option) {
        this.id = option.id;
        this.getDoctorInfo();
        this.getAppraiseList();
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
    getAppraiseList() {
        wx.jyApp.http({
            url: '/doctorappraise/list',
            data: {
                doctorId: this.id,
                page: 1,
                limit: 3
            }
        }).then((data) => {
            this.setData({
                appraiseNum: data.page.totalCount,
                appraiseList: data.page.list
            });
        });
    },
    onClickConsult() {
        wx.navigateTo({
            url: '/pages/interrogation/illness-edit/index?doctorId=' + this.id
        });
    }
})