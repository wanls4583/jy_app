Page({
    data: {
        doctorId: '',
        doctor: {},
        appraiseNum: 0,
        appraiseList: [],
        detailVisble: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'configData'],
            actions: ['updateUserInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            doctorId: option.doctorId
        });
        this.getDoctorInfo();
        this.getAppraiseList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        if (wx.jyApp.tempData.payInterrogationResult) { //问诊支付结果
            if (wx.jyApp.tempData.payInterrogationResult.result == 'fail') {
                setTimeout(() => {
                    wx.jyApp.toast('支付失败');
                }, 500);
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.tempData.payInterrogationResult.id
                });
            } else if(wx.jyApp.tempData.payInterrogationResult.type == 3) { //视频问诊
                setTimeout(() => {
                    wx.jyApp.toast('支付成功');
                }, 500);
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.tempData.payInterrogationResult.id
                });
            } else {
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/chat/index?id=' + wx.jyApp.tempData.payInterrogationResult.id
                });
            }
            delete wx.jyApp.tempData.payInterrogationResult
        }
    },
    onShareAppMessage: function (res) {
        return {
            title: this.data.doctor.doctorName || '医生',
            path: '/pages/index/index?type=2&dId=' + this.data.doctorId,
            imageUrl: this.data.doctor.avatar || '/image/logo.png'
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
                wx.jyApp.utils.navigateTo({
                    url: '/pages/mall/search-doctor/index'
                });
            });
        } else {
            wx.jyApp.utils.navigateTo(e);
        }
    },
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src]
        });
    },
    //查看详情
    onShowDetail() {
        this.setData({
            detailVisble: !this.data.detailVisble
        });
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
    },
    getPhoneNumber(e) {
        var type = e.currentTarget.dataset.type;
        if (e.detail.iv && e.detail.encryptedData) {
            wx.showLoading({
                title: '获取中...',
                mask: true
            });
            wx.jyApp.http({
                url: '/wx/user/authorize/phone',
                method: 'post',
                data: {
                    iv: e.detail.iv,
                    encryptedData: e.detail.encryptedData
                }
            }).then((data) => {
                this.data.userInfo.phone = data.phone;
                this.updateUserInfo(Object.assign({}, this.data.userInfo));
            }).finally(() => {
                wx.hideLoading();
                wx.jyApp.utils.navigateTo({
                    url: `/pages/interrogation/${type==3?'appointment-select':'illness-edit'}/index?doctorId=${this.data.doctorId}&type=${type}`
                });
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: `/pages/interrogation/${type==3?'appointment-select':'illness-edit'}/index?doctorId=${this.data.doctorId}&type=${type}`
            });
        }
    }
})