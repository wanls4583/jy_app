/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        id: '',
        filtrateId: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            beginTime: '',
            continueTime1: '',
            way: '',
            continueTime2: '',
            count: '',
            effect: '',
        },
        result: '',
        dateVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                doctorName: option.doctorName,
                patient: patient,
                'filtrateId': option.filtrateId || '',
                'consultOrderId': option.consultOrderId || '',
                'patientId': option.patientId || '',
                'filtrateType': option.filtrateType || '',
            });
        } else {
            this.loadInfo(option.id);
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
    },
    onShowDate() {
        this.dateProp = 'filtrateDate';
        this.setData({
            date: this.data.answers.filtrateDate ? Date.prototype.parseDate(this.data.answers.filtrateDate) : new Date().getTime(),
            dateVisible: true
        });
    },
    onShowBeginTime() {
        this.dateProp = 'beginTime';
        this.setData({
            date: this.data.answers.beginTime ? Date.prototype.parseDate(this.data.answers.beginTime) : new Date().getTime(),
            dateVisible: true
        });
    },
    onConfirmDate(e) {
        var date = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            ['answers.' + this.dateProp]: date,
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
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/fatevaluate/info/${id}`,
        }).then((data) => {
            data.fatEvaluate = data.fatEvaluate || {};
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                id: data.fatEvaluate.id || '',
                filtrateId: data.fatEvaluate.filtrateId || '',
                patient: data.patientFiltrate
            });
            if(data.fatEvaluate.answers) {
                data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
                this.setData({
                    answers: data.fatEvaluate.answers,
                });
            }
        });
    },
    countResult() {
        var result = '无肥胖治疗史';
        if (this.data.answers.way || this.data.answers.continueTime2 || this.data.answers.count || this.data.answers.effect) {
            result = '有肥胖治疗史'
        }
        this.setData({
            result: result,
            isRisk: result == '有肥胖治疗史'
        });
    },
    onSave() {
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            isRisk: this.data.isRisk,
            type: 'FAT-TREAT'
        };
        wx.jyApp.showLoading('加载中...', true);
        if (this.from == 'screen') {
            this.save(data);
        } else {
            this.saveWithChat(data);
        }
    },
    save(data) {
        wx.jyApp.http({
            url: `/fatevaluate/${data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/screen/food-investigate/index'
                    });
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    saveWithChat(data) {
        if (!data.filtrateId) {
            wx.jyApp.http({
                url: `/patient/filtrate/save${this.data.patientId?'/v2':''}`, //v2版接口使用patientId字段，v1版本使用consultOrderId字段
                method: 'post',
                data: {
                    consultOrderId: this.data.consultOrderId,
                    patientId: this.data.patientId,
                    filtrateType: this.data.filtrateType,
                    isSelf: true,
                }
            }).then((_data) => {
                data.filtrateId = _data.filtrateId;
                this.save(data);
            }).catch(() => {
                wx.hideLoading();
            });
        } else {
            this.save(data);
        }
    },
    onBack() {
        wx.jyApp.utils.navigateBack();
    }
})