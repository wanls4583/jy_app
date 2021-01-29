/*
 * @Author: lisong
 * @Date: 2020-11-30 09:33:23
 * @Description: 
 */
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        banner: [],
        stopRefresh: false,
        systemInfo: wx.getSystemInfoSync()
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo', 'doctorInfo', 'configData', 'consultNum', 'videoBookNum'],
                actions: ['updateDoctorInfo'],
            });
            this.storeBindings.updateStoreBindings();
            this.setData({
                minContentHeight: wx.getSystemInfoSync().windowHeight - 80
            });
            if (this.data.userInfo.role == 'DOCTOR') {
                this.loadBaner();
            }
            if (!wx.getStorageSync('doctor-first-in')) {
                wx.showModal({
                    content: '为了您能实时收到患者问诊订单消息，请允许接收消息通知。',
                    confirmText: '允许',
                    success: (res) => {
                        if (res.confirm) {
                            var subIds = [];
                            subIds.push(wx.jyApp.constData.subIds.patientPayMsg);
                            subIds.push(wx.jyApp.constData.subIds.appointment);
                            subIds.push(wx.jyApp.constData.subIds.appointmentSuc);
                            wx.jyApp.utils.requestSubscribeMessage(subIds).finally(() => {
                                wx.setStorageSync('doctor-first-in', 1);
                            });
                        }
                    }
                });
            }
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    pageLifetimes: {
        show() {}
    },
    methods: {
        onGoto(e) {
            var url = e.currentTarget.dataset.url;
            wx.jyApp.utils.navigateTo({
                url: url
            });
        },
        //跳转前检查医生状态
        onCheckGoto(e) {
            if (wx.jyApp.utils.checkDoctor()) {
                this.onGoto(e);
            }
        },
        onRefresh(e) {
            wx.jyApp.Promise.all([
                this.getDoctorInfo(),
                this.loadBaner,
                wx.jyApp.utils.getAllConfig()
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                });
            });
        },
        onClickBanner(e) {
            var item = e.currentTarget.dataset.item;
            if (item.linkUrl && item.type != 2) {
                wx.jyApp.utils.openWebview(item.linkUrl);
            }
        },
        //获取医生信息
        getDoctorInfo() {
            var doctorId = wx.getStorageSync('doctorType') == 2 ? this.data.userInfo.offlineDoctorId : this.data.userInfo.doctorId;
            return wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
                if (data.doctor) {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                }
            });
        },
        loadBaner() {
            return wx.jyApp.http({
                url: '/banner/list',
                data: {
                    bannerCode: '0003'
                }
            }).then((data) => {
                this.setData({
                    banner: data.list
                });
            });
        },
    }
})