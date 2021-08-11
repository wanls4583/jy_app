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
        this.checkOption(this.option);
        this.firstLoad = true;
        this.loadDiagnosis();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        wx.showLoading({
            title: '加载中...'
        });
        //登录检测
        wx.jyApp.loginUtil.login({
            inviteDoctorId: Number(this.inviteDoctorId) || '',
            inviteWay: this.inviteWay
        }).then((data) => {
            wx.hideLoading();
            if (data.doctorStatus == 3) {
                wx.showModal({
                    title: '提示',
                    content: '医生已暂停服务，你可以去首页看看！',
                    showCancel: false,
                    success: (res) => {
                        if (res.confirm) {
                            _getInfo.bind(this)();
                        }
                    }
                })
            } else {
                _getInfo.bind(this)();
            }
        }).catch(() => {
            wx.hideLoading();
            wx.jyApp.toast('登录失败');
        });

        function _getInfo() {
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
                if (this.firstLoad) {
                    if (this.url) {
                        if (this.routeType == 'switchTab') {
                            wx.switchTab({
                                url: this.url
                            });
                        } else {
                            wx.jyApp.utils.navigateTo({
                                url: this.url
                            });
                        }
                    } else if (this.inviteWay == 'salesman') { //扫业务员二维码进入
                        if (wx.jyApp.store.userInfo.role == 'USER') {
                            this.data.userInfo.role = 'DOCTOR';
                            this.updateUserInfo(Object.assign({}, this.data.userInfo));
                            wx.setStorageSync('role', 'DOCTOR');
                        }
                        wx.jyApp.utils.navigateTo({
                            url: '/pages/interrogation/certification/index'
                        });
                    } else if (this._inviteWay == 2) { //扫医生二维码进入
                        wx.jyApp.loginUtil.getDoctorInfo(this.inviteDoctorId).then((data) => {
                            var url = '';
                            var tabs = [
                                '/pages/tab-bar-first/index',
                                '/pages/tab-bar-second/index',
                                '/pages/interrogation/message-list/index',
                                '/pages/mine/index',
                            ]
                            switch (data.doctor.barcodePath) {
                                case '/pages/tab-bar-first/index':
                                case '/pages/tab-bar-second/index':
                                    //医生扫医生的二维码进入首页或商城页需要先切换称患者
                                    if (wx.jyApp.store.userInfo.role == 'DOCTOR') {
                                        this.data.userInfo.role = 'USER';
                                        this.updateUserInfo(Object.assign({}, this.data.userInfo));
                                        wx.setStorageSync('role', 'USER');
                                    }
                                    default:
                                        url = data.doctor.barcodePath;
                            }
                            var type = '';
                            if (url.slice(0, 6) == '/pages') {
                                if (tabs.indexOf(url) > -1) {
                                    type = 'tab';
                                }
                                if (type != 'tab') {
                                    if (url.indexOf('?') > -1) {
                                        url += '&doctorId=' + this.inviteDoctorId + '&from=barcode';
                                    } else {
                                        url += '?doctorId=' + this.inviteDoctorId + '&from=barcode';
                                    }
                                }
                                wx.jyApp.utils.navigateTo({
                                    url: url,
                                    type: type
                                });
                            } else {
                                wx.jyApp.utils.openWebview(url);
                            }
                        }).catch(() => {
                            wx.switchTab({
                                url: '/pages/tab-bar-first/index'
                            });
                        });
                    } else if (this.screenDoctorId) { //扫医生筛查二维码进入
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
                        }
                        if (screen) { //跳转到具体的筛查页
                            wx.jyApp.loginUtil.getDoctorInfo(this.screenDoctorId).then((data) => {
                                var doctor = data.doctor;
                                if (this.data.userInfo.role == 'USER') {
                                    this.getPatient().then((data) => {
                                        if (data.list && data.list.length) {
                                            sUrl = `/pages/interrogation/user-patient-list/index?screen=${screen}&doctorId=${doctor.id}&doctorName=${doctor.doctorName}&select=true`;
                                        } else {
                                            sUrl = `/pages/interrogation/user-patient-edit/index?screen=${screen}&doctorId=${doctor.id}&doctorName=${doctor.doctorName}&select=true`;
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
                            }).catch(()=>{
                                wx.jyApp.toast('医生已下线');
                                wx.switchTab({
                                    url: '/pages/tab-bar-first/index'
                                });
                            });
                        } else {
                            wx.jyApp.utils.navigateTo({
                                url: sUrl
                            });
                        }
                    } else if (this.doctorId || this.inviteDoctorId) { //医生主页
                        wx.jyApp.utils.navigateTo({
                            url: '/pages/interrogation/doctor-detail/index?doctorId=' + (this.doctorId || this.inviteDoctorId)
                        });
                    } else if (this.productId) { //产品主页
                        wx.jyApp.utils.navigateTo({
                            url: '/pages/mall/product-detail/index?id=' + this.productId
                        });
                    } else {
                        wx.switchTab({
                            url: '/pages/tab-bar-first/index'
                        });
                    }
                } else {
                    wx.switchTab({
                        url: '/pages/tab-bar-first/index'
                    });
                }
                this.firstLoad = false;
            }).catch((e) => {
                console.log(e);
            });
        }
    },
    //检查启动参数
    checkOption(option) {
        console.log('检查启动参数');
        //type:{-1:直接跳转,1:邀请,2:医生主页, 3:产品主页}
        if (option.type == -1 && option.url) { //有page直接跳转
            this.url = decodeURIComponent(option.url);
            this.routeType = option.routeType || 'navigateTo';
        } else if (option.type == 1 && option.dId) { //医生通过小程序分享邀请医生
            this.inviteDoctorId = option.dId;
            this.inviteWay = 'doctor';
            this._inviteWay = 1;
        } else if (option.type == 2 && option.dId) { //医生主页
            this.doctorId = option.dId;
        } else if (option.type == 3 && option.pId) { //产品主页
            this.productId = option.pId;
        } else if (option.scene) { //扫二维码进入
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            console.log(param);
            if (param.type == 1 && param.dId) { //医生二维码
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
                this._inviteWay = 2;
            } else if (param.type == 2 && param.dId) { //医生筛查二维码
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
                this._inviteWay = 3;
                this.screenDoctorId = param.dId;
                this.screenType = param.stype;
            } else if (param.type == 3 && param.dId) { //医生通过二维码邀请医生
                this.inviteDoctorId = param.dId;
                this.inviteWay = 'doctor';
                this._inviteWay = 4;
            } else if (param.type == 4 && param.sId) { //业务员通过二维码邀请医生
                this.inviteDoctorId = param.sId;
                this.inviteWay = 'salesman';
            }
        }
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
            this.getRoomInfo.loading = false;
            clearTimeout(this.getRoomInfo.timer)
            this.getRoomInfo.timer = setTimeout(() => {
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