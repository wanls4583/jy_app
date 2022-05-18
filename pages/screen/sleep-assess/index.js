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
        this.share = option.share || '';
        this.from = option.from || '';
        this.roomId = option.roomId || '';
        this.doctorId = option.doctorId || '';
        this.showResult = option.showResult || '';
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
        this.setData({
            'filtrateId': option.filtrateId || '',
            'consultOrderId': option.consultOrderId || '',
            'patientId': option.patientId || '',
        });
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
        var result = '';
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
        } else if (q.length) {
            result = '睡眠正常';
            resultDescription = ['未发现存在睡眠问题'];
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
            data.fatEvaluate = data.fatEvaluate || {};
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            var filtrateId = data.patientFiltrate.id;
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.doctorId = data.patientFiltrate.doctorId;
            this.setData({
                id: data.fatEvaluate.id || '',
                filtrateId: filtrateId,
                patient: data.patientFiltrate
            });
            if (data.fatEvaluate.answers) {
                data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
                this.setData({
                    answers: data.fatEvaluate.answers,
                });
                if (data.fatEvaluate.answers.filtrateDate) {
                    this.setData({
                        filtrateDate: Date.prototype.parseDate(data.fatEvaluate.answers.filtrateDate)
                    });
                }
            }
            if(this.showResult) {
                this.onSave();
                return;
            };
        });
    },
    gotoResult(data, redirect) {
        var result = 0;
        if (this.data.result == '睡眠异常') {
            result = 2;
        }
        const url = `/pages/screen/fat-result/index?result=${result}&_result=${this.data.result}&patientId=${this.data.patientId}&doctorId=${this.doctorId}&consultOrderId=${this.data.consultOrderId}&from=${this.from}&roomId=${this.roomId}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}`
        wx.jyApp.setTempData('results', this.data.resultDescription.split(';'));
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
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            doctorId: this.doctorId,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-SLEEP',
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk
        };
        if(this.showResult) {
            this.gotoResult(data, true);
            return;
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
        }).then((_data) => {
            data.filtrateId = data.filtrateId || _data.filtrateId;
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    this.gotoResult(data);
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
                    filtrateType: 'FAT-SLEEP',
                    isSelf: this.data.userInfo.role == 'DOCTOR',
                    roomId: this.roomId
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
        this.setData({
            step: this.data.step - 1
        });
    }
})