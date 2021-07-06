/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        step: 1,
        id: '',
        filtrateId: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            q: [],
        },
        result: '',
        resultDescription: '',
        filtrateDate: new Date().getTime(),
        dateVisible: false,
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
        var step = prop.slice('answers.q['.length);
        step = Number(step.slice(0, -1)) + 1;
        this.setData({
            [`${prop}`]: e.detail,
        });
        setTimeout(() => {
            if (step == 5) {
                this.onSave();
            } else {
                this.setData({
                    step: step + 1
                });
            }
        }, 500);
    },
    countResult() {
        var result = '睡眠正常';
        var resultDescription = [];
        var q = this.data.answers.q;
        if (q[0] == 1) {
            resultDescription.push('入睡潜伏期延长');
        }
        if (q[1] == 1) {
            resultDescription.push('白天瞌睡');
        }
        if (q[2] == 1) {
            resultDescription.push('存在夜醒及再入睡困难');
        }
        if (q[3] == 1) {
            resultDescription.push('睡眠不足');
        }
        if (q[3] == 3) {
            resultDescription.push('睡眠时间过长');
        }
        if (q[4] == 1) {
            resultDescription.push('存在睡眠呼吸障碍');
        }
        if (resultDescription.length) {
            result = '睡眠异常';
        }

        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            isRisk: result == '睡眠异常'
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
            if (data.fatEvaluate.answers.filtrateDate) {
                this.setData({
                    filtrateDate: Date.prototype.parseDate(data.fatEvaluate.answers.filtrateDate)
                });
            }
        });
    },
    onSave() {
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-SLEEP',
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk
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
                    var result = 1;
                    if (this.data.result == '睡眠异常') {
                        result = 2;
                    }
                    wx.jyApp.setTempData('sleep-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/sleep-result/index?result=${result}&_result=${this.data.result}`
                    });
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    onBack() {
        this.setData({
            step: this.data.step - 1
        });
    }
})