Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        settlementUrl: '',
        stopRefresh: false,
        userInfoButtonVisible: true,
        canIUseGetUserProfile: wx.getUserProfile ? true : false,
        menuRect: wx.jyApp.utils.getMenuRect()
    },
    lifetimes: {
        attached(option) {
            this.storeBindings = wx.jyApp.createStoreBindings(this, {
                store: wx.jyApp.store,
                fields: ['userInfo', 'doctorInfo', 'pharmacistInfo', 'noticeCount', 'configData'],
                actions: ['updateUserInfo', 'updateDoctorInfo', 'updatePharmacistInfo', 'updateNoticeCount'],
            });
            this.storeBindings.updateStoreBindings();
        },
        detached() {
            this.storeBindings.destroyStoreBindings();
        }
    },
    methods: {
        onShow() {
            this.getMessageCount();
            if (wx.getStorageSync('hasPopUserAuth') == 1 || this.data.userInfo.avatarUrl) {
                this.setData({
                    userInfoButtonVisible: false
                });
            }
        },
        onRefresh() {
            wx.jyApp.Promise.all([
                this.reLogin(),
                this.getMessageCount(),
                wx.jyApp.utils.getAllConfig()
            ]).finally(() => {
                this.setData({
                    stopRefresh: true
                })
            });
        },
        //页面跳转
        onGoto(e) {
            wx.jyApp.utils.navigateTo(e);
        },
        onGotoUser() {
            wx.jyApp.utils.navigateTo({
                url: '/pages/user/index'
            });
        },
        //跳转前检查医生状态
        onCheckGoto(e) {
            var incomeSwitch = e.currentTarget.dataset.incomeSwitch;
            if (wx.jyApp.utils.checkDoctor()) {
                if (incomeSwitch && this.data.doctorInfo.incomeSwitch != 1 && this.data.doctorInfo.role != 'DOCTOR_TEST') {
                    wx.jyApp.toast('该功能已关闭，请联系管理员！');
                } else {
                    this.onGoto(e);
                }
            }
        },
        onOpenWebview(e) {
            wx.jyApp.utils.openWebview(e);
        },
        //切换账号
        onSitchRole() {
            if (this.data.userInfo.role == 'DOCTOR') {
                if(this.data.doctorInfo && this.data.doctorInfo.hosDepartment && this.data.userInfo.viewVersion!=2) {
                    wx.jyApp.toast('请扫描科室医生二维码进行问诊');
                    return;
                }
                wx.setStorageSync('role', 'USER');
                wx.reLaunch({
                    url: '/pages/index/index'
                });
            } else {
                wx.setStorageSync('role', 'DOCTOR');
                wx.reLaunch({
                    url: '/pages/index/index'
                });
            }
        },
        onSelectDoctorType(e) {
            wx.setStorageSync('role', 'DOCTOR');
            wx.reLaunch({
                url: '/pages/index/index'
            });
        },
        //拨打电话
        onClickPhone() {
            wx.makePhoneCall({
                phoneNumber: this.data.configData.service_phone,
                complete: (msg) => {
                    console.log(msg);
                }
            })
        },
        getUserProfile(e) {
            wx.getUserProfile({
                desc: '用于完善个人资料',
                success: (res) => {
                    this.getWxUserInfo({
                        detail: {
                            userInfo: res.userInfo
                        }
                    })
                }
            })
        },
        getWxUserInfo(e) {
            var userInfo = e.detail.userInfo;
            if (userInfo && this.data.userInfoButtonVisible) {
                userInfo.sex = userInfo.gender == 1 ? 1 : 2;
                if (userInfo.nickName != '微信用户') {
                    userInfo.nickname = userInfo.nickName;
                }
                wx.showLoading({
                    title: '更新资料中...',
                    mask: true
                });
                wx.jyApp.loginUtil.updateUserInfo(userInfo).then(() => {
                    Object.assign(this.data.userInfo, userInfo);
                    this.updateUserInfo(Object.assign({}, this.data.userInfo));
                }).finally(() => {
                    wx.hideLoading();
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/user/index'
                    });
                });
            } else {
                wx.jyApp.utils.navigateTo({
                    url: '/pages/user/index'
                });
            }
        },
        //重新登录
        reLogin() {
            return wx.jyApp.loginUtil.login().then(() => {
                return this.getUserInfo().then((data) => {
                    var doctorId = data.info.currentDoctorId;
                    return doctorId && wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
                        if (wx.jyApp.store.userInfo.role == 'DOCTOR') {
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
                });
            });
        },
        //获取未读消息数量
        getMessageCount() {
            return wx.jyApp.http({
                url: '/systemnotice/totalNotRead'
            }).then((data) => {
                this.updateNoticeCount(data.totalNotRead || 0);
            })
        },
        //获取用户后台信息
        getUserInfo() {
            return wx.jyApp.loginUtil.getUserInfo().then((data) => {
                if (!data.info.nickname) {
                    data.info.nickname = 'wx-' + wx.jyApp.utils.getUUID(8);
                    wx.jyApp.loginUtil.updateUserInfo({
                        nickname: data.info.nickname
                    });
                }
                var role = wx.getStorageSync('role');
                if (role && role.indexOf('DOCTOR') > -1) {
                    data.info.role = 'DOCTOR';
                } else {
                    data.info.role = 'USER';
                }
                this.updateUserInfo(data.info);
                return data;
            });
        },
    }
})