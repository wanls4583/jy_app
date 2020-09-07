Page({
    data: {
        doctorId: '',
        doctor: {},
        appraiseNum: 0,
        appraiseList: []
    },
    onLoad(option) {
        this.setData({
            doctorId: option.id
        });
        this.getDoctorInfo();
        this.getAppraiseList();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    getDoctorInfo() {
        wx.jyApp.http({
            url: '/doctor/info/' + this.data.doctorId
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
                doctorId: this.data.doctorId,
                page: 1,
                limit: 3
            }
        }).then((data) => {
            data.page.list.map((item) => {
                if (item.type == 1) {
                    item._type = '图文问诊';
                }
            });
            this.setData({
                appraiseNum: data.page.totalCount,
                appraiseList: data.page.list
            });
        });
    }
})