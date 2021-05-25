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
            phone: ''
        },
        minDate: new Date(1900, 0, 1).getTime(),
        maxDate: new Date().getTime(),
        sexVisible: false,
        birthDayVisible: false,
        birthday: new Date().getTime()
    },
    onLoad(option) {
        // 是否从医生详情页跳过来的
        this.doctorId = option.doctorId;
        this.doctorName = option.doctorName;
        if (option.id) {
            this.loadInfo(option.id);
            wx.setNavigationBarTitle({
                title: '编辑患者'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '添加患者'
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
            'patient.BMI': BMI && BMI.toFixed(2) || ''
        });
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
            wx.jyApp.toast('请填写患者姓名');
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
        if (!/1\d{10}/.test(this.data.patient.phone)) {
            wx.jyApp.toast('请填写手机号');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        wx.jyApp.http({
            url: `/patientdocument/${this.data.patient.id ? 'update' : 'save'}`,
            method: 'post',
            data: this.data.patient
        }).then((data) => {
            wx.hideLoading();
            if (!this.doctorId) {
                var page = wx.jyApp.utils.getPages('pages/interrogation/user-patient-list/index');
                if (page) {
                    page.loadList().then(() => {
                        page.setData({
                            selectId: this.data.patient.id || data.id
                        });
                    });
                }
                wx.jyApp.toastBack('保存成功');
            } else {
                this.data.patient.id = data.id;
                wx.jyApp.setTempData('screenPatient', this.data.patient);
                wx.redirectTo({
                    url: `/pages/screen/nrs/index?doctorId=${this.doctorId}&&doctorName=${this.doctorName}`
                });
            }
        }).catch(() => {
            wx.hideLoading();
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/patientdocument/info/${id}`
        }).then((data) => {
            var patient = data.patientDocument;
            patient._sex = patient.sex == 1 ? '男' : '女';
            patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
            patient.BMI = patient.BMI && patient.BMI.toFixed(2) || '';
            this.data.birthday = Date.prototype.parseDate(patient.birthday).getTime();
            this.setData({
                patient: patient,
                birthday: this.data.birthday
            });
        });
    }
})