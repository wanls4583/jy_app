/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        sga: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            weightLose: '',
            dietChange: '',
            stomachSymptom: '',
            activity: '',
            stressReaction: '',
            muscle: '',
            fatLose: '',
            edema: '',
            result: '',
        },
        dateVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.share = option.share || '';
        // 患者通过筛查选择页面进入
        this.from = option.from || '';
        this.roomId = option.roomId || '';
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            var filtrateByName = option.filtrateByName;
            if(this.from === 'screen') {
                if(this.data.userInfo.role === 'DOCTOR' && this.data.doctorInfo) {
                    filtrateByName = this.data.doctorInfo.doctorName;
                } else {
                    filtrateByName = patient.patientName;
                }
            }
            this.setData({
                filtrateByName: filtrateByName,
                doctorName: option.doctorName,
                patient: patient,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.sga.id) {
                    this.setData({
                        filtrateByName: option.filtrateByName,
                    });
                }
            });
        }
        this.setData({
            'sga.filtrateId': option.filtrateId,
            'consultOrderId': option.consultOrderId,
            'patientId': option.patientId,
            'filtrateType': 'SGA',
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
        this.countScore();
    },
    onShowDate() {
        // this.setData({
        //     dateVisible: true
        // });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'sga.filtrateDate': filtrateDate,
            dateVisible: false
        });
    },
    onCancelDate() {
        this.setData({
            dateVisible: false
        });
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
        this.countScore();
    },
    setBMI() {
        if (this.data.patient.height && this.data.patient.weight) {
            var BMI = _getBMI(this.data.patient.height, this.data.patient.weight)
            this.setData({
                'patient.BMI': BMI
            });
        }

        function _getBMI(stature, weight) {
            var BMI = (weight) / (stature * stature / 10000);
            BMI = BMI && BMI.toFixed(1) || '';
            return BMI || '';
        }
    },
    //计算总分
    countScore() {
        var scoreMap = {
            'A': 0,
            'B': 0,
            'C': 0
        }
        var checkPass = true;
        var prop = ['weightLose', 'dietChange', 'stomachSymptom', 'activity', 'stressReaction', 'muscle', 'fatLose', 'edema'];
        var result = '';
        prop.map(item => {
            if (!this.data.sga[item]) {
                checkPass = false;
            }
        });
        if (!checkPass) {
            this.setData({
                'sga.result': ''
            });
            return;
        }
        prop.map(item => {
            scoreMap[this.data.sga[item]]++;
        });
        if (scoreMap['A'] >= 5) {
            result = 'A';
        } else if (scoreMap['C'] >= 5) {
            result = 'C';
        } else {
            result = 'B';
        }
        this.setData({
            'sga.result': result
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/filtrate/sga/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateSga = data.filtrateSga || this.data.sga;
            data.filtrateSga.filtrateDate = data.patientFiltrate.filtrateDate;
            var filtrateId = data.patientFiltrate.id;
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                sga: data.filtrateSga,
                filtrateId: filtrateId,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
        });
    },
    onSave() {
        var data = {
            ...this.data.sga
        };
        wx.jyApp.showLoading('加载中...', true);
        if (this.from == 'screen' && !data.id) {
            this.save(data);
        } else {
            this.saveWithChat(data);
        }
    },
    // 普通筛查
    save(data) {
        data.patientId = this.patient.id;
        data.doctorId = this.doctorId;
        wx.jyApp.http({
            url: `/filtrate/sga/public/save`,
            method: 'post',
            data: data
        }).then((_data) => {
            data.filtrateId = _data.filtrateId;
            this.saveSuccess(data);
        }).catch(() => {
            wx.hideLoading();
        });
    },
    // 聊天室里的筛查
    saveWithChat(data) {
        if (!data.filtrateId) {
            wx.jyApp.http({
                url: `/patient/filtrate/save${this.data.patientId?'/v2':''}`, //v2版接口使用patientId字段，v1版本使用consultOrderId字段
                method: 'post',
                data: {
                    consultOrderId: this.data.consultOrderId,
                    patientId: this.data.patientId,
                    filtrateType: this.data.filtrateType,
                    isSelf: this.data.userInfo.role == 'DOCTOR',
                    roomId: this.roomId
                }
            }).then((_data) => {
                data.filtrateId = _data.filtrateId;
                _save.bind(this)();
            }).catch(() => {
                wx.hideLoading();
            });
        } else {
            _save.bind(this)();
        }

        function _save() {
            wx.jyApp.http({
                url: `/filtrate/sga/${this.data.sga.id?'update':'save'}`,
                method: 'post',
                data: data
            }).then(() => {
                var page = wx.jyApp.utils.getPageByLastIndex(2);
                if (page.route == 'pages/screen/screen-list/index') {
                    page.onRefresh();
                }
                this.saveSuccess(data);
            }).catch(() => {
                wx.hideLoading();
            });
        }
    },
    saveSuccess(data) {
        wx.jyApp.toastBack('保存成功', {
            mask: true,
            delta: 1,
            complete: () => {
                var result = 0;
                var _result = '营养良好';
                if (data.result == 'B') {
                    result = 1;
                    _result = '轻~中度营养不良';
                }
                if (data.result == 'C') {
                    result = 2;
                    _result = '重度营养不良';
                }
                if (this.data.userInfo.role != 'DOCTOR') {
                    setTimeout(() => {
                        wx.jyApp.utils.navigateTo({
                            url: `/pages/screen/screen-result/index?result=${result}&_result=${_result}&doctorId=${this.doctorId}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.filtrateType||this.data.filtrateType}`
                        });
                    }, 500);
                }
            }
        });
    }
})