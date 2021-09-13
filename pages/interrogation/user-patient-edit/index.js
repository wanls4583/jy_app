const app = getApp()

Page({
    data: {
        patient: {
            id: '',
            patientName: '',
            _sex: '',
            sex: '',
            birthday: '',
            height: '',
            weight: '',
            BMI: '',
            foodSensitive: '',
            phone: '',
            defaultFlag: 0
        },
        minDate: new Date(1900, 0, 1).getTime(),
        maxDate: new Date().getTime(),
        sexVisible: false,
        birthDayVisible: false,
        birthday: new Date().getTime()
    },
    onLoad(option) {
        // 患者端v2版本选择默认患者
        this.joinDoctorId = wx.getStorageSync('join-doctorId');
        // 是否从医生详情页跳过来的
        this.screen = option.screen;
        this.doctorId = option.doctorId || '';
        this.doctorName = option.doctorName || '';
        this.setData({
            screen: this.screen,
            joinDoctorId: this.joinDoctorId
        });
        if (this.doctorId) {
            this.setData({
                saveText: '下一页',
            });
        }
        if (option.id) {
            this.loadInfo(option.id);
            wx.setNavigationBarTitle({
                title: '编辑成员'
            });
        } else {
            if (this.joinDoctorId) {
                this.setData({
                    'patient.defaultFlag': 1
                });
            }
            wx.setNavigationBarTitle({
                title: '添加成员'
            });
        }
    },
    onInput(e) {
        if (typeof e.detail == 'string') {
            e.detail = e.detail.replace(wx.jyApp.constData.emojiReg, '');
        } else {
            e.detail.value = e.detail.value.replace(wx.jyApp.constData.emojiReg, '');
        }
        wx.jyApp.utils.onInput(e, this);
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        var BMI = (this.data.patient.weight) / (this.data.patient.height * this.data.patient.height / 10000);
        this.setData({
            'patient.BMI': BMI && BMI.toFixed(1) || ''
        });
    },
    onSwitchDefault(e) {
        if (!this.joinDoctorId) {
            this.setData({
                'patient.defaultFlag': this.data.patient.defaultFlag == 1 ? 0 : 1
            });
        }
    },
    onShowBirthday() {
        this.setData({
            birthDayVisible: true
        });
    },
    onShowSex() {
        this.setData({
            sexVisible: true
        });
    },
    onConfirmSex(e) {
        this.setData({
            'patient.sex': e.detail.index == 0 ? 2 : 1,
            'patient._sex': e.detail.value,
            sexVisible: false
        });
    },
    onConfirmBirthday(e) {
        var birthday = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'patient.birthday': birthday,
            birthDayVisible: false
        });
    },
    onCancel() {
        this.setData({
            birthDayVisible: false,
            sexVisible: false
        });
    },
    onSave() {
        if (!this.data.patient.patientName) {
            wx.jyApp.toast('请填写成员姓名');
            return;
        }
        if (!this.data.patient.sex) {
            wx.jyApp.toast('请填写性别');
            return;
        }
        if (!this.data.patient.birthday) {
            wx.jyApp.toast('请填出生日期');
            return;
        }
        if (this.screen != 'fat' && this.screen != 'fat-assess' && !/1\d{10}/.test(this.data.patient.phone)) {
            wx.jyApp.toast('手机号格式不正确');
            return;
        }
        if(this.joinDoctorId) {
            this.data.patient.doctorId = this.joinDoctorId;
        }
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/patientdocument/${this.data.patient.id ? 'update' : 'save'}`,
            method: 'post',
            data: this.data.patient
        }).then((data) => {
            var page = wx.jyApp.utils.getPages('pages/interrogation/user-patient-list/index');
            if (page) {
                page.loadList().then(() => {
                    page.setData({
                        selectId: this.data.patient.id || data.id
                    });
                });
            }
            if (this.screen || this.joinDoctorId) {
                // 筛查页面
                this.loadInfo(data.id).then(() => {
                    if (this.screen) {
                        wx.jyApp.setTempData('screenPatient', this.data.patient);
                        if (this.screen == 'fat' || this.screen == 'fat-assess') {
                            if (!(this.data.patient.age >= 6 && this.data.patient.age <= 18)) {
                                wx.jyApp.toast('该项筛查/评估适用年龄为6-18岁');
                                return;
                            }
                        }
                        wx.redirectTo({
                            url: `/pages/screen/${this.screen}/index?doctorId=${this.doctorId}&&doctorName=${this.doctorName}&from=screen`
                        });
                    } else {
                        wx.reLaunch({
                            url: '/pages/index/index'
                        });
                    }
                });
            } else {
                wx.jyApp.toastBack('保存成功', {
                    mask: true
                });
            }
        }).catch(() => {
            wx.hideLoading();
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/patientdocument/info/${id}`
        }).then((data) => {
            var patient = data.patientDocument;
            patient._sex = patient.sex == 1 ? '男' : '女';
            patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
            patient.BMI = patient.BMI && patient.BMI.toFixed(1) || '';
            this.data.birthday = Date.prototype.parseDate(patient.birthday).getTime();
            this.setData({
                patient: patient,
                birthday: this.data.birthday
            });
        });
    }
})