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
    onShow() {
        if (wx.jyApp.payInterrogationResult) { //问诊支付结果
            if (wx.jyApp.payInterrogationResult.result == 'fail') {
                wx.jyApp.toast('支付失败');
                setTimeout(() => {
                    wx.navigateTo({
                        url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.payInterrogationResult.id
                    });
                }, 1500)
            } else {
                wx.navigateTo({
                    url: '/pages/interrogation/chat/index?id=' + wx.jyApp.payInterrogationResult.id
                });
            }
            delete wx.jyApp.payInterrogationResult
        }
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onConsult(e) {
        if (!this.data.doctor.id) {
            return;
        }
        if (this.data.doctor.status != 1) {
            wx.jyApp.dialog.confirm({
                message: '该医生已下线，你可以找其他医生进行问诊咨询',
                confirmButtonText: '找其他医生'
            }).then(() => {
                wx.navigateTo({
                    url: '/pages/mall/search-doctor/index'
                });
            });
        } else {
            wx.jyApp.utils.navigateTo(e);
        }
    },
    getDoctorInfo() {
        wx.jyApp.loginUtil.getDoctorInfo(this.data.doctorId).then((data) => {
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