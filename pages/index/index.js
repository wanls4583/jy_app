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
            actions: ['updateUserInfo', 'updateDoctorInfo', 'updateNoticeCount', 'updateMsgCount', 'updateConsultNum', 'addCart', 'updateCartNum'],
        });
        this.storeBindings.updateStoreBindings();
        this.checkOption(this.option);
        this.firstLoad = true;
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
                this.to = 2;
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
                    this.updateDoctorInfo(Object.assign({}, data.doctor));
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
                    } else if (this.inviteWay == 2) { //扫医生二维码进入
                        wx.jyApp.loginUtil.getDoctorInfo(this.inviteDoctorId).then((data) => {
                            var url = '';
                            var tabs = [
                                '/pages/tab-bar-first/index',
                                '/pages/tab-bar-second/index',
                                '/pages/interrogation/message-list/index',
                                '/pages/min/index',
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
                                if (url.indexOf('?') > -1) {
                                    url += '&doctorId=' + this.inviteDoctorId;
                                } else {
                                    url += '?doctorId=' + this.inviteDoctorId;
                                }
                                wx.jyApp.utils.navigateTo({
                                    url: url,
                                    type: type
                                });
                            } else {
                                wx.jyApp.utils.openWebview(url);
                            }
                        }).catch(() => {
                            wx.switchTab({ url: '/pages/tab-bar-first/index' });
                        });
                    } else if (this.doctorId) {
                        wx.jyApp.utils.navigateTo({
                            url: '/pages/interrogation/doctor-detail/index?doctorId=' + this.doctorId
                        });
                    } else if (this.productId) {
                        wx.jyApp.utils.navigateTo({
                            url: '/pages/mall/product-detail/index?id=' + this.productId
                        });
                    } else {
                        wx.switchTab({ url: '/pages/tab-bar-first/index' });
                    }
                } else {
                    wx.switchTab({ url: '/pages/tab-bar-first/index' });
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
        //to:{1:医生详情页,2:首页,3:商城页,4:门诊患者页}
        if (option.type == -1 && option.url) { //有page直接跳转
            this.url = decodeURIComponent(option.url);
            this.routeType = option.routeType || 'navigateTo';
        } else if (option.type == 1 && option.dId) { //医生通过好友分享邀请
            this.inviteDoctorId = option.dId;
            this.doctorId = option.dId;
            this.inviteWay = 1;
        } else if (option.type == 2 && option.dId) { //医生主页
            this.doctorId = option.dId;
        } else if (option.type == 3 && option.pId) { //产品主页
            this.productId = option.pId;
        } else if (option.scene) { //扫二维码进入
            var param = wx.jyApp.utils.parseScene(option.scene) || {};
            console.log(param);
            if (param.type == 1 && param.dId) { //医生通过二维码或名片分享邀请
                this.inviteWay = 2;
                this.inviteDoctorId = param.dId;
                this.doctorId = param.dId;
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
            var doctorType = wx.getStorageSync('doctorType');
            var doctorId = data.info.doctorId;
            if (role == 'DOCTOR') {
                data.info.role = 'DOCTOR';
            } else if (role == 'USER') {
                data.info.role = 'USER';
            }
            if (!role && data.info.switchStatus == 1) {
                data.info.role = 'DOCTOR';
            }
            if (doctorType == 2) { //线下医生
                doctorId = data.info.offlineDoctorId
            }
            this.updateUserInfo(data.info);
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
            return Promise.resolve();
        }
        return wx.jyApp.http({
            url: '/systemnotice/totalNotRead',
            hideTip: true
        }).then((data) => {
            this.updateNoticeCount(data.totalNotRead || 0);
            this.updateMsgCount(data.msgTotalNotRead || 0);
            this.updateVideoBookNum(data.videoBookNum || 0);
            this.updateConsultNum(data.consultNum);
            if (data.msgTotalNotRead) {
                wx.setTabBarBadge({
                    index: 2,
                    text: String(data.msgTotalNotRead),
                    fail() { }
                });
            } else {
                wx.removeTabBarBadge({
                    index: 2,
                    fail() { }
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
        wx.jyApp.room.getRoomInfo().then((data) => {
            try {
                if (data.data) {
                    var page = getCurrentPages()[0].route;
                    data = JSON.parse(data.data);
                    if (data.type == 'CALL') { //通话邀请
                        if (page != '/pages/trtc/index') {
                            wx.jyApp.utils.navigateTo({
                                url: `/pages/trtc/index?consultOrderId=${data.consultOrderId}&roomId=${data.roomId}&nickname=${data.user.nickname}&avatar=${data.user.avatar}&active=true`
                            });
                        }
                    }
                    wx.jyApp.tempData.roomInfoCallBack && wx.jyApp.tempData.roomInfoCallBack(data.data);
                }
            } catch (e) {

            }
        }).finally(() => {
            setTimeout(() => {
                this.getRoomInfo();
            }, 2000);
        });
    }
})