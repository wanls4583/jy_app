Page({
    data: {
        userInfo: null,
        messageCount: 0
    },
    onLoad(option) {
        console.log(option);
        this.option = option;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
            actions: ['updateUserInfo', 'updateDoctorInfo', 'updatePharmacistInfo', 'updateNoticeCount', 'updateMsgCount', 'updateConsultNum', 'updateVideoBookNum', 'updatePhoneBookNum', 'addCart', 'updateCartNum'],
        });
        this.storeBindings.updateStoreBindings();
        this.firstLoad = true;
        this.checkOption(this.option);
        this.loadDiagnosis();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        clearTimeout(this.getRoomInfo.timer);
    },
    onShow() {
        if (!this.firstLoad) {
            wx.redirectTo({
                url: '/pages/tab-bar/index'
            });
            return;
        }
        wx.showLoading({
            title: '加载中...'
        });
        //登录检测
        wx.jyApp.loginUtil.login({
            inviteDoctorId: Number(this.inviteDoctorId) || '',
            inviteWay: this.inviteWay
        }).then((data) => {
            wx.hideLoading();
            this.loginData = data;
            if (data.doctorStatus == 3) {
                wx.showModal({
                    title: '提示',
                    content: '医生已暂停服务，你可以去首页看看！',
                    showCancel: false,
                    success: (res) => {
                        if (res.confirm) {
                            this.jump();
                        }
                    }
                })
            } else {
                this.jump();
            }
        }).catch(() => {
            wx.hideLoading();
        });
    },
    //检查启动参数
    checkOption(option) {
        console.log(option);
        //type:{-1:直接跳转,1:邀请,2:医生主页, 3:产品主页}
        if (option.type == -1 && option.url) { //有page直接跳转
            this.url = decodeURIComponent(option.url);
            this.routeType = option.routeType || 'navigateTo';
        } else if (option.type == 1 && option.dId) { //医生通过小程序分享邀请医生
            this.inviteDoctorId = option.dId;
            this.inviteWay = 'doctor';
        } else if (option.type == 2 && option.dId) { //医生主页或者分享筛查二维码
            this.doctorId = option.dId;
        } else if (option.type == 3 && option.pId) { //产品主页
            this.productId = option.pId;
        } else if (option.type == 4) { //医生分享二维码
            option.type = option.subType;
            _handleType.call(this, option.subType, option);
        } else if (option.scene) { //扫二维码进入
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            console.log(param);
            _handleType.call(this, param.type, param);
        }

        // 判断二维码类型
        function _handleType(type, param) {
            if (type == 1 && param.dId) { //医生名片二维码
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
                this.barcodType = 'card';
            } else if (type == 2 && param.dId) { //医生筛查二维码
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
                this.screenDoctorId = param.dId;
                this.screenType = param.stype;
                this.barcodType = 'screen';
            } else if (type == 3 && param.dId) { //医生通过二维码邀请医生
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
            } else if (type == 4 && param.sId) { //业务员通过二维码邀请医生
                this.inviteDoctorId = param.sId;
                this.inviteWay = 'salesman';
            } else if (type == 5 && param.dpId) { //医生扫科室二维码进入科室
                this.inviteDoctorId = param.dpId;
                this.inviteWay = 'department';
            }
            if (this.inviteWay == 'salesman' || this.inviteWay == 'department') {
                wx.setStorageSync('role', 'DOCTOR');
            } else {
                wx.setStorageSync('role', 'USER');
            }
        }
    },
    // 跳转页面
    jump() {
        wx.showLoading({
            title: '加载中...'
        });
        this.getUserInfo().then((doctorId) => {
            return doctorId && wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
                if (wx.jyApp.store.userInfo.role == 'DOCTOR') {
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
                } else {
                    this.updatePharmacistInfo(Object.assign({}, data.doctor));
                }
                this.storeBindings.updateStoreBindings();
            }).catch(() => {
                // 获取不到医生信息，切换到患者端
                wx.jyApp.store.userInfo.role = 'USER';
                wx.setStorageSync('role', 'USER');
                this.updateUserInfo(Object.assign({}, wx.jyApp.store.userInfo));
                this.storeBindings.updateStoreBindings();
            });
        }).finally(() => {
            wx.hideLoading();
            this.getMessageCount();
            this.getRoomInfo();
            if (this.url) { //通过url直接跳转
                this.handleUrl();
            } else if (this.inviteWay == 'salesman') { //扫业务员二维码进入
                this.handleSalesmanCode();
            } else if (this.inviteWay == 'department') { //扫科室二维码进入
                this.handleDepartmentCode();
            } else if (this.barcodType == 'card') { //扫医生名片二维码进入
                this.handleCardCode();
            } else if (this.barcodType == 'screen') { //扫医生筛查二维码进入
                this.handleScreenCode();
            } else if (this.doctorId || this.inviteDoctorId) { //医生主页
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/doctor-detail/index?doctorId=' + (this.doctorId || this.inviteDoctorId)
                });
            } else if (this.productId) { //产品主页
                wx.jyApp.utils.navigateTo({
                    url: '/pages/mall/product-detail/index?id=' + this.productId
                });
            } else {
                wx.redirectTo({
                    url: '/pages/tab-bar/index'
                });
            }
            this.firstLoad = false;
        }).catch((e) => {
            console.log(e);
        });
    },
    handleUrl() {
        if (this.routeType == 'switchTab') {
            wx.redirectTo({
                url: this.url
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: this.url
            });
        }
    },
    handleSalesmanCode() {
        if (this.data.doctorInfo) {
            wx.redirectTo({
                url: '/pages/tab-bar/index'
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/certification/index'
            });
        }
    },
    handleDepartmentCode() {
        if (!this.data.doctorInfo) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/certification/index'
            });
        } else {
            if (this.loginData.tag == 2 || this.loginData.tag == 3) { //2:加入成功,3:之前已经加过该科室
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/my-team/index'
                });
            } else {
                wx.redirectTo({
                    url: '/pages/tab-bar/index'
                });
            }
        }
    },
    handleCardCode() {
        wx.jyApp.loginUtil.getDoctorInfo(this.inviteDoctorId).then((data) => {
            var doctor = data.doctor;
            var url = '';
            // 患者通过扫医生的码加入科室
            if (doctor.hosDepartment && this.loginData.tag != 1) { // tag==1代表科室已下线
                this.getPatient().then((data) => {
                    if (data.list && data.list.length) {
                        url = `/pages/interrogation/user-patient-list/index?select=true&joinDoctorId=${this.inviteDoctorId}`;
                    } else {
                        url = `/pages/interrogation/user-patient-edit/index?select=true&joinDoctorId=${this.inviteDoctorId}`;
                    }
                    wx.jyApp.utils.navigateTo({
                        url: url
                    });
                });
                return;
            }
            // tab页
            var tabs = [
                '/pages/mall/home/index',
                '/pages/mall/mall/index',
                '/pages/interrogation/home/index',
                '/pages/interrogation/doctor-patient-list/index',
                '/pages/interrogation/message-list/index',
                '/pages/mine/index',
            ]
            url = doctor.barcodePath;
            if (url.slice(0, 6) == '/pages') {
                if (tabs.indexOf(url) > -1) {
                    url = '/pages/tab-bar/index?url=' + url;
                    wx.redirectTo({
                        url: url
                    });
                } else {
                    if (url.indexOf('?') > -1) {
                        url += '&doctorId=' + this.inviteDoctorId + '&from=barcode';
                    } else {
                        url += '?doctorId=' + this.inviteDoctorId + '&from=barcode';
                    }
                    wx.jyApp.utils.navigateTo({
                        url: url
                    });
                }
            } else {
                wx.jyApp.utils.openWebview(url);
            }
        }).catch(() => {
            wx.redirectTo({
                url: '/pages/tab-bar/index'
            });
        });
    },
    handleScreenCode() {
        var sUrl = '/pages/screen/screen-select/index?doctorId=' + this.screenDoctorId;
        var screen = '';
        switch (Number(this.screenType)) {
            case 1:
                screen = 'nrs';
                break;
            case 2:
                screen = 'pgsga'
                break;
            case 3:
                screen = 'sga'
                break;
            case 4:
                screen = 'must'
                break;
            case 5:
                screen = 'mna'
                break;
            case 6:
                screen = 'fat'
                break;
            case 7:
                screen = 'fat-assess'
                break;
            case 8:
                screen = 'tumour-fluid'
                break;
            case 9:
                screen = 'oral-mucosa'
                break;
            case 10:
                screen = 'radiation-injury'
                break;
        }
        wx.jyApp.loginUtil.getDoctorInfo(this.screenDoctorId).then((data) => {
            var doctor = data.doctor;
            if (screen) { //跳到具体的筛查页面
                if (this.data.userInfo.role == 'USER') {
                    this.getPatient().then((data) => {
                        if (data.list && data.list.length) {
                            sUrl = `/pages/interrogation/user-patient-list/index?screen=${screen}&doctorId=${doctor.id}&doctorName=${doctor.doctorName}&select=true&joinDoctorId=${data.doctor.id}`;
                        } else {
                            sUrl = `/pages/interrogation/user-patient-edit/index?screen=${screen}&doctorId=${doctor.id}&doctorName=${doctor.doctorName}&select=true&joinDoctorId=${data.doctor.id}`;
                        }
                        wx.jyApp.utils.navigateTo({
                            url: sUrl
                        });
                    });
                } else {
                    sUrl = `/pages/interrogation/user-patient-edit/index?screen=${screen}&doctorId=${doctor.id}&doctorName=${doctor.doctorName}&select=true`;
                    wx.jyApp.utils.navigateTo({
                        url: sUrl
                    });
                }
            } else {
                wx.jyApp.utils.navigateTo({
                    url: sUrl
                });
            }
            // 患者通过扫医生的码加入可是
            if (data.doctor.hosDepartment) {
                wx.setStorageSync('join-doctorId', data.doctor.id);
            }
        }).catch(() => {
            wx.jyApp.toast('医生已下线');
            wx.redirectTo({
                url: '/pages/tab-bar/index'
            });
        });
    },
    getUserInfo() {
        return wx.jyApp.loginUtil.getUserInfo().then((data) => {
            if (!data.info.nickname) {
                data.info.nickname = 'wx-' + wx.jyApp.utils.getUUID(8);
                wx.jyApp.loginUtil.updateUserInfo({
                    nickname: data.info.nickname
                });
            }
            var role = wx.getStorageSync('role');
            var doctorId = '';
            if (role) {
                if (role == 'USER') {
                    if (data.info.originRole == 'PHARMACIST') { // 药师
                        doctorId = data.info.doctorId;
                    }
                    data.info.role = 'USER';
                } else {
                    data.info.role = 'DOCTOR';
                    doctorId = data.info.currentDoctorId;
                }
            } else {
                doctorId = data.info.doctorId || data.info.offlineDoctorId;
                if (doctorId) {
                    data.info.role = 'DOCTOR';
                    if (data.info.doctorId) {
                        wx.setStorageSync('role', 'DOCTOR');
                    } else {
                        wx.setStorageSync('role', 'DOCTOR_OFFLINE');
                    }
                } else {
                    data.info.role = 'USER';
                    wx.setStorageSync('role', 'USER');
                }
            }
            if (doctorId) {
                data.info.currentDoctorId = doctorId;
            }
            this.updateUserInfo(data.info);
            this.storeBindings.updateStoreBindings();
            if (data.info.role == 'USER') {
                this.getCart();
            }
            return doctorId;
        });
    },
    getMessageCount() {
        var pages = getCurrentPages();
        if (pages.length > 1) {
            clearTimeout(wx.jyApp.pollCountTimer);
            wx.jyApp.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 5000);
            return wx.jyApp.Promise.resolve();
        }
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead',
            hideTip: true
        }).then((data) => {
            this.updateNoticeCount(data.totalNotRead || 0);
            this.updateMsgCount(data.msgTotalNotRead || 0);
            this.updateVideoBookNum(data.videoBookNum || 0);
            this.updatePhoneBookNum(data.phoneBookNum || 0);
            this.updateConsultNum(data.consultNum);
            if (data.msgTotalNotRead) {
                wx.setTabBarBadge({
                    index: 2,
                    text: String(data.msgTotalNotRead),
                    fail() {}
                });
            } else {
                wx.removeTabBarBadge({
                    index: 2,
                    fail() {}
                });
            }
        }).finally(() => {
            clearTimeout(wx.jyApp.pollCountTimer);
            wx.jyApp.pollCountTimer = setTimeout(() => {
                this.getMessageCount();
            }, 5000);
        });
    },
    //获取购物车内容
    getCart() {
        var ids = [];
        var countMap = {};
        var cart = wx.jyApp.utils.getLocalCart();
        if (cart && cart.length) {
            cart.map((item) => {
                var id = item.id;
                if (ids.indexOf(id) == -1) {
                    ids.push(id);
                    countMap[id] = item.count;
                }
            });
            wx.jyApp.http({
                url: '/goods/infos',
                data: {
                    ids: ids.join(',')
                }
            }).then((data) => {
                data.infos = data.infos || [];
                data.infos.map((item) => {
                    this.addCart(item);
                    this.updateCartNum(item.id, countMap[item.id]);
                });
            });
        }
    },
    //获取视频通话信息
    getRoomInfo() {
        if (this.getRoomInfo.loading) {
            return;
        }
        this.getRoomInfo.loading = true;
        wx.jyApp.room.getRoomInfo().then((data) => {
            try {
                if (data.data) {
                    var page = getCurrentPages();
                    page = page[page.length - 1].route;
                    data = JSON.parse(data.data);
                    if (data.type == 'CALL') { //通话邀请
                        if (page != 'pages/trtc/index') {
                            wx.jyApp.utils.navigateTo({
                                url: `/pages/trtc/index?consultOrderId=${data.consultOrderId}&roomId=${data.roomId}&nickname=${data.user.nickname}&avatar=${data.user.avatarUrl}&recieve=true`
                            });
                        }
                    }
                    wx.jyApp.tempData.roomInfoCallBack && wx.jyApp.tempData.roomInfoCallBack(data);
                }
            } catch (e) {

            }
        }).finally(() => {
            this.getRoomInfo.timer = setTimeout(() => {
                this.getRoomInfo.loading = false;
                this.getRoomInfo();
            }, 2000);
        });
    },
    //预加载所有诊断
    loadDiagnosis() {
        wx.jyApp.http({
            url: '/disease/diagnosis'
        }).then((data) => {
            wx.jyApp.setTempData('allDiagnosis', data.list);
        });
    },
    getPatient() {
        return wx.jyApp.http({
            url: '/patientdocument/list',
            data: {
                page: 1,
                limit: 1
            }
        });
    },
})