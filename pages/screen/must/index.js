/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        patient: {},
        filtrateDate: new Date().getTime(),
        must: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            bmiScore: null,
            stature: '',
            weight: '',
            BMI: '',
            weightScore: '',
            diseaseScore: '',
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
        this.showResult = option.showResult || '';
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
                'must.stature': patient.height,
                'must.weight': patient.weight,
            });
            this.setBMI();
            this.countScore();
        } else {
            this.loadInfo(option.id).then(() => {
                if (!this.data.must.id) {
                    this.setData({
                        filtrateByName: option.filtrateByName,
                        'must.stature': patient.height,
                        'must.weight': patient.weight,
                    });
                    this.setBMI();
                    this.countScore();
                }
            });
        }
        this.setData({
            'must.filtrateId': option.filtrateId,
            'consultOrderId': option.consultOrderId,
            'patientId': option.patientId,
            'filtrateType': 'MUST',
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
        this.setBMI();
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
            'must.filtrateDate': filtrateDate,
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
        if (this.data.must.stature && this.data.must.weight) {
            var BMI = _getBMI(this.data.must.stature, this.data.must.weight)
            this.setData({
                'must.BMI': BMI,
                'must.bmiScore': BMI >= 20 ? 0 : (BMI <= 18.5 ? 2 : 1)
            });
        }
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
        var count = (Number(this.data.must.weightScore) || 0) + (Number(this.data.must.bmiScore) || 0) + (Number(this.data.must.diseaseScore) || 0);
        this.setData({
            'must.result': count,
            'must._result': count == 0 ? '0' : (count == 1 ? '1' : '2')
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/filtrate/must/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.filtrateMust = data.filtrateMust || this.data.must;
            data.filtrateMust.filtrateDate = data.patientFiltrate.filtrateDate;
            var filtrateId = data.patientFiltrate.id;
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.doctorId = data.patientFiltrate.doctor || '';
            if (data.filtrateMust.result) {
                data.filtrateMust._result = data.filtrateMust.result == 0 ? '0' : (data.filtrateMust.result == 1 ? '1' : '2');
            }
            this.setData({
                must: data.filtrateMust,
                filtrateId: filtrateId,
                patient: data.patientFiltrate,
                filtrateByName: data.patientFiltrate.filtrateByName,
                doctorName: data.patientFiltrate.doctorName,
            });
            this.setBMI();
            if(this.showResult) {
                this.onSave();
                return;
            };
        });
    },
    gotoResult(data, redirect) {
        var result = 0;
        var _result = '低度营养风险';
        if (data._result == '1') {
            result = 2;
            _result = '中度营养风险';
        }
        if (data._result == '2') {
            result = 3;
            _result = '重度营养风险';
        }
        const url = `/pages/screen/screen-result/index?result=${result}&_result=${_result}&doctorId=${this.doctorId}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.filtrateType||this.data.filtrateType}`
        if(redirect) {
            wx.redirectTo({
                url: url
            });
        } else {
            wx.jyApp.utils.navigateTo({
                url: url
            });
        }
    },
    onSave() {
        var data = {
            ...this.data.must
        }
        if(this.showResult) {
            this.gotoResult(data, true);
            return;
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
            url: `/filtrate/must/public/save`,
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
                url: `/filtrate/must/${this.data.must.id?'update':'save'}`,
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
                this.gotoResult(data);
            }
        });
    }
})