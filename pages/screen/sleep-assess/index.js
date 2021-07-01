/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        step: 1,
        id: '',
        patient: {},
        answers: {
            filtrateDate: new Date().formatTime('yyyy-MM-dd'),
            q: [],
        },
        result: [],
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
    countScore() {
        var result = [];
        var q = this.data.answers.q;
        if (q[0] == 1) {
            result.push('入睡潜伏期延长');
        }
        if (q[1] == 1) {
            result.push('白天瞌睡');
        }
        if (q[2] == 1) {
            result.push('存在夜醒及再入睡困难');
        }
        if (q[3] == 1) {
            result.push('睡眠不足');
        }
        if (q[3] == 3) {
            result.push('睡眠时间过长');
        }
        if (q[4] == 1) {
            result.push('存在睡眠呼吸障碍');
        }

        this.setData({
            result: result
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
    onSave() {
        this.countScore();
        var data = {
            id: this.data.id,
            patientId: this.patient.id,
            answers: this.data.answers,
            type: 'BIRTH-HISTORY',
            result: this.data.result
        };
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: `/fatevaluate/save`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    var _result = '睡眠正常';
                    if (this.data.result.length) {
                        result = 2;
                        _result = '睡眠异常';
                    }
                    wx.jyApp.setTempData('sleep-results', this.data.result);
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/sleep-result/index?result=${result}&_result=${_result}&from=${this.from}`
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