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
        this.from = option.from || '';
        this.roomId = option.roomId || '';
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
        this.setData({
            'filtrateId': option.filtrateId || '',
            'consultOrderId': option.consultOrderId || '',
            'patientId': option.patientId || '',
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        this.countScore();
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
            if (step == 1) {
                this.onSave();
            } else {
                this.setData({
                    step: step + 1
                });
            }
        }, 500);
    },
    countScore() {
        var result = '';
        var q = this.data.answers.q;
        if (this.data.patient.sex == 1) {
            if (q[0] == 1) {
                result = '体脂肪含量正常';
            }
            if (q[0] == 2) {
                result = '轻度肥胖';
            }
            if (q[0] == 3) {
                result = '中度肥胖';
            }
            if (q[0] == 4 || q[0] == 5 || q[0] == 6) {
                result = '重度肥胖';
            }
        } else {
            if (this.data.patient.age >= 6 && this.data.patient.age <= 14) {
                if (q[0] == 1 || q[0] == 2) {
                    result = '体脂肪含量正常';
                }
                if (q[0] == 3) {
                    result = '轻度肥胖';
                }
                if (q[0] == 4) {
                    result = '中度肥胖';
                }
                if (q[0] == 5 || q[0] == 6) {
                    result = '重度肥胖';
                }
            }
            if (this.data.patient.age >= 15 && this.data.patient.age <= 18) {
                if (q[0] == 1 || q[0] == 2 || q[0] == 3) {
                    result = '体脂肪含量正常';
                }
                if (q[0] == 4) {
                    result = '轻度肥胖';
                }
                if (q[0] == 5) {
                    result = '中度肥胖';
                }
                if (q[0] == 6) {
                    result = '重度肥胖';
                }
            }
        }

        this.setData({
            result: result,
            resultDescription: result == '体脂肪含量正常' ? '未发现存在体脂肪含量问题' : result,
            isRisk: result != '体脂肪含量正常',
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
            this.setData({
                id: data.fatEvaluate.id || '',
                filtrateId: filtrateId,
                patient: data.patientFiltrate
            });
            if(data.fatEvaluate.answers) {
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
        });
    },
    onSave() {
        this.countScore();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-BODY',
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk
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
                    var result = 1;
                    if (this.data.result == '轻度肥胖') {
                        result = 2;
                    }
                    if (this.data.result == '中度肥胖') {
                        result = 3;
                    }
                    if (this.data.result == '重度肥胖') {
                        result = 4;
                    }
                    wx.jyApp.setTempData('body-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/body-result/index?result=${result}&_result=${this.data.result}&patientId=${this.data.patientId}&consultOrderId=${this.data.consultOrderId}&from=${this.from}&roomId=${this.roomId}`
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
                    filtrateType: 'FAT-BODY',
                    isSelf: true,
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