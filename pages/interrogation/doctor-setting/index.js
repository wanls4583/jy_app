Page({
    data: {
        consultOrderPrice: 0,
        nutritionOrderPrice: 0,
        consultOrderSwitch: 0,
        showable: 0,
        showableVisible: false,
        showableList: [],
        showableMap: {},
        showableDefault: 0,
        videoOrderSwitch: 0,
        videoOrderPrice: 0,
        phoneOrderSwitch: 0,
        phoneOrderPrice: 0,
        videoServiceTime: null,
        phoneServiceTime: null,
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
            actions: ['updateDoctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            consultOrderPrice: this.data.doctorInfo.incomeSwitch == 1 && this.data.doctorInfo.consultOrderPrice || 0,
            videoOrderPrice: this.data.doctorInfo.incomeSwitch == 1 && this.data.doctorInfo.videoOrderPrice || 0,
            phoneOrderPrice: this.data.doctorInfo.incomeSwitch == 1 && this.data.doctorInfo.phoneOrderPrice || 0,
            nutritionOrderPrice: this.data.doctorInfo.incomeSwitch == 1 && this.data.doctorInfo.nutritionOrderPrice || 0,
            consultOrderSwitch: this.data.doctorInfo.consultOrderSwitch,
            videoOrderSwitch: this.data.doctorInfo.videoOrderSwitch,
            phoneOrderSwitch: this.data.doctorInfo.phoneOrderSwitch,
            showable: this.data.doctorInfo.showable,
            videoServiceTime: this.data.doctorInfo.videoServiceTime,
            phoneServiceTime: this.data.doctorInfo.phoneServiceTime,
            showableDefault: this.data.doctorInfo.showable == 0 ? 1 : 0,
            showableList: [{
                label: '展示',
                value: 1
            }, {
                label: '不展示',
                value: 0
            }],
            showableMap: {
                1: '展示',
                0: '不展示',
            }
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onSwitchChange(e) {
        this.setData({
            consultOrderSwitch: this.data.consultOrderSwitch == 1 ? 0 : 1
        });
        this.submit();
    },
    onSwitchVideoChange(e) {
        this.setData({
            videoOrderSwitch: this.data.videoOrderSwitch == 1 ? 0 : 1
        });
        this.submit();
    },
    onSwitchPhoneChange(e) {
        this.setData({
            phoneOrderSwitch: this.data.phoneOrderSwitch == 1 ? 0 : 1
        });
        this.submit();
    },
    onClickTextPrice() {
        if (this.data.doctorInfo.role == 'DOCTOR_TEST') {
            wx.jyApp.toast('测试医生不支持该操作');
            return;
        }
        if (this.data.doctorInfo.incomeSwitch != 1) {
            return;
        }
        wx.jyApp.utils.setText({
            title: '图文问诊每次金额',
            defaultValue: this.data.consultOrderPrice,
            type: 'int',
            complete: (value) => {
                if (value < 0 || value > 1000) {
                    setTimeout(() => {
                        wx.jyApp.toast('图文问诊金额需在0-1000范围内');
                    }, 500);
                    return;
                }
                this.setData({
                    consultOrderPrice: value || 0
                });
                this.submit();
            }
        });
    },
    onClickVideoPrice() {
        if (this.data.doctorInfo.role == 'DOCTOR_TEST') {
            wx.jyApp.toast('测试医生不支持该操作');
            return;
        }
        if (this.data.doctorInfo.incomeSwitch != 1) {
            return;
        }
        wx.jyApp.utils.setText({
            title: '视频问诊每次金额',
            defaultValue: this.data.videoOrderPrice,
            type: 'int',
            complete: (value) => {
                if (value < 0 || value > 1000) {
                    setTimeout(() => {
                        wx.jyApp.toast('视频问诊金额需在0-1000范围内');
                    }, 500);
                    return;
                }
                this.setData({
                    videoOrderPrice: value || 0
                });
                this.submit();
            }
        });
    },
    onClickPhonePrice() {
        if (this.data.doctorInfo.role == 'DOCTOR_TEST') {
            wx.jyApp.toast('测试医生不支持该操作');
            return;
        }
        if (this.data.doctorInfo.incomeSwitch != 1) {
            return;
        }
        wx.jyApp.utils.setText({
            title: '电话问诊每次金额',
            defaultValue: this.data.phoneOrderPrice,
            type: 'int',
            complete: (value) => {
                if (value < 0 || value > 1000) {
                    setTimeout(() => {
                        wx.jyApp.toast('电话问诊金额需在0-1000范围内');
                    }, 500);
                    return;
                }
                this.setData({
                    phoneOrderPrice: value || 0
                });
                this.submit();
            }
        });
    },
    onClickGuidePrice() {
        if (this.data.doctorInfo.role == 'DOCTOR_TEST') {
            wx.jyApp.toast('测试医生不支持该操作');
            return;
        }
        if (this.data.doctorInfo.incomeSwitch != 1) {
            return;
        }
        wx.jyApp.utils.setText({
            title: '营养处方诊金',
            defaultValue: this.data.nutritionOrderPrice,
            type: 'number',
            complete: (value) => {
                if (value < 0 || value > 1000) {
                    setTimeout(() => {
                        wx.jyApp.toast('营养处方诊金额需在0-100范围内');
                    }, 500);
                    return;
                }
                this.setData({
                    nutritionOrderPrice: value
                });
                this.submit();
            }
        });
    },
    onClickStatus() {
        if (this.data.doctorInfo.role == 'DOCTOR_TEST') {
            wx.jyApp.toast('测试医生不支持该操作');
            return;
        }
        if (this.data.doctorInfo.status != 1 && this.data.doctorInfo.status != 2) {
            return;
        }
        this.setData({
            showableVisible: true
        });
    },
    onConfirmStatus(e) {
        this.setData({
            showableVisible: false,
            showable: e.detail.value.value
        });
        this.submit();
    },
    onCancel() {
        this.setData({
            showableVisible: false
        });
    },
    onSetTime() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/appointment-setting/index'
        });
        wx.jyApp.tempData.setTimeCallback = (videoServiceTime, phoneServiceTime) => {
            if (videoServiceTime) {
                this.setData({
                    videoServiceTime: videoServiceTime
                });
            }
            if (phoneServiceTime) {
                this.setData({
                    phoneServiceTime: phoneServiceTime,
                });
            }
            this.submit();
        };
    },
    submit() {
        return wx.jyApp.http({
            url: '/doctor/config',
            method: 'post',
            data: {
                consultOrderPrice: this.data.doctorInfo.incomeSwitch == 1 ? (Number(this.data.consultOrderPrice) || 0) : this.data.doctorInfo.consultOrderPrice,
                videoOrderPrice: this.data.doctorInfo.incomeSwitch == 1 ? (Number(this.data.videoOrderPrice) || 0) : this.data.doctorInfo.videoOrderPrice,
                phoneOrderPrice: this.data.doctorInfo.incomeSwitch == 1 ? (Number(this.data.phoneOrderPrice) || 0) : this.data.doctorInfo.videoOrderPrice,
                nutritionOrderPrice: this.data.doctorInfo.incomeSwitch == 1 ? (Number(this.data.nutritionOrderPrice) || 0) : this.data.doctorInfo.nutritionOrderPrice,
                consultOrderSwitch: this.data.consultOrderSwitch,
                videoOrderSwitch: this.data.videoOrderSwitch,
                phoneOrderSwitch: this.data.phoneOrderSwitch,
                showable: this.data.showable,
                videoServiceTime: this.data.videoServiceTime,
                phoneServiceTime: this.data.phoneServiceTime
            }
        }).then(() => {
            if (this.data.doctorInfo.incomeSwitch == 1) {
                this.data.doctorInfo.consultOrderPrice = Number(this.data.consultOrderPrice) || 0
                this.data.doctorInfo.videoOrderPrice = Number(this.data.videoOrderPrice) || 0
                this.data.doctorInfo.phoneOrderPrice = Number(this.data.phoneOrderPrice) || 0
                this.data.doctorInfo.nutritionOrderPrice = Number(this.data.nutritionOrderPrice) || 0
            }
            this.data.doctorInfo.consultOrderSwitch = this.data.consultOrderSwitch
            this.data.doctorInfo.videoOrderSwitch = this.data.videoOrderSwitch
            this.data.doctorInfo.phoneOrderSwitch = this.data.phoneOrderSwitch
            this.data.doctorInfo.showable = this.data.showable
            this.data.doctorInfo.videoServiceTime = this.data.videoServiceTime
            this.data.doctorInfo.phoneServiceTime = this.data.phoneServiceTime
            this.updateDoctorInfo(Object.assign({}, this.data.doctorInfo))
        });
    }
})