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
        articleList: [],
        stopRefresh: false,
        systemInfo: wx.getSystemInfoSync(),
    },
    lifetimes: {
        attached() {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo', 'doctorInfo', 'configData', 'consultNum', 'videoBookNum', 'phoneBookNum'],
                actions: ['updateDoctorInfo', 'updateUserInfo'],
            });
            this.storeBindings.updateStoreBindings();
            this.setData({
                minContentHeight: wx.getSystemInfoSync().windowHeight - 80 - 50,
            });
            if (this.data.userInfo.role == 'DOCTOR') {
                this.loadBaner();
                this.loadArticle();
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
    methods: {
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        //跳转前检查医生状态
        onCheckGoto(e) {
            if (wx.jyApp.utils.checkDoctor()) {
                this.onGoto(e);
            }
        },
        //跳转前检查医生资质完整状态
        onCheckGotoWithFullCertification(e) {
            if (wx.jyApp.utils.checkDoctor({
                    checkFullAuthStatus: true
                })) {
                this.onGoto(e);
            }
        },
        onCheckGotoWithDepartDoctor(e) {
            if (this.data.doctorInfo && this.data.doctorInfo.hosDepartment) {
                this.onGoto(e);
            }
        },
        onRefresh(e) {
            wx.jyApp.Promise.all([
                this.getDoctorInfo(),
                this.loadBaner(),
                this.loadArticle(),
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
            var doctorId = this.data.userInfo.role == 'DOCTOR' && this.data.userInfo.doctorId;
            if (!doctorId) {
                this.updateDoctorInfo(null);
            }
            return doctorId && wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
                if (wx.jyApp.store.userInfo.originRole == 'DOCTOR') {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                } else {
                    this.updatePharmacistInfo(Object.assign({}, data.doctor));
                }
            }).catch(() => {
                // 获取不到医生信息，切换到患者端
                wx.setStorageSync('role', 'USER');
                wx.reLaunch({
                    url: '/pages/index/index'
                });
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
        loadArticle() {
            return wx.jyApp.http({
                url: '/article/list',
                data: {
                    page: 1,
                    limit: 3
                }
            }).then((data) => {
                this.setData({
                    articleList: data.page.list
                });
            });
        }
    }
})