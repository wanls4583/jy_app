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
            way: '',
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
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                id: data.fatEvaluate.id || '',
                filtrateId: data.fatEvaluate.filtrateId || '',
                answers: data.fatEvaluate.answers,
                patient: data.patientFiltrate
            });
        });
    },
    countResult() {
        var result = '无肥胖治疗史';
        if (this.data.answers.way || this.data.answers.continueTime1 || this.data.answers.continueTime2 || this.data.answers.count || this.data.answers.effect) {
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
    onBack() {
        wx.jyApp.utils.navigateBack();
    }
})