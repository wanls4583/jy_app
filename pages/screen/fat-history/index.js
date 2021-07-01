/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        id: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            q1: '',
            q2: '',
            q3: '',
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
        // 患者通过筛查选择页面进入
        this.from = option.from;
        this.doctorId = option.doctorId || '';
        this.patient = patient;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                doctorName: option.doctorName,
                patient: patient,
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
        this.setBMI();
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
    onShowContinuTime() {
        this.dateProp = 'continueTime';
        this.setData({
            date: this.data.answers.continueTime ? Date.prototype.parseDate(this.data.answers.continueTime) : new Date().getTime(),
            dateVisible: true
        });
    },
    onShowContinuTime1() {
        this.dateProp = 'continueTime1';
        this.setData({
            date: this.data.answers.continueTime1 ? Date.prototype.parseDate(this.data.answers.continueTime1) : new Date().getTime(),
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
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
            this.setData({
                id: data.fatEvaluate.id || '',
                answers: data.fatEvaluate.answers,
                patient: data.patientFiltrate
            });
        });
    },
    onSave() {
        var data = {
            id: this.data.id,
            patientId: this.patient.id,
            answers: this.data.answers,
            type: 'BIRTH-HISTORY'
        };
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/fatevaluate/save`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    onBack() {
        wx.jyApp.utils.navigateBack();
    }
})