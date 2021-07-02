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
            q: []
        },
        result: '',
        filtrateDate: new Date().getTime(),
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
        this.setBMI();
    },
    onShowDate() {
        this.setData({
            dateVisible: true
        });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'answers.filtrateDate': filtrateDate,
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
            if (data.fatEvaluate.answers.filtrateDate) {
                this.setData({
                    filtrateDate: Date.prototype.parseDate(data.fatEvaluate.answers.filtrateDate)
                });
            }
        });
    },
    countResult() {
        var q = this.data.answers.q;
        var result = '正常';
        if ((q[0] == 2 || q[0] == 3) || (q[1] == 2 || q[1] == 3) || (q[2] == 2) || (q[3] == 1 || q[3] == c)) {
            result = '异常'
        }
        this.setData({
            result: result
        });
    },
    onSave() {
        this.countResult();
        var data = {
            id: this.data.id,
            patientId: this.patient.id,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            type: 'FAT-GROW'
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
                        url: '/pages/screen/family-history/index'
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