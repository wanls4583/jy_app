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
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
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
            if (step == 17) {
                this.onSave();
            } else {
                if (step == 14) {
                    var answer = this.data.answers.q[13];
                    if (answer == 1 || answer == 2) {
                        step = 17
                    } else if (answer == 3) {
                        step++;
                    } else {
                        step += 2;
                    }
                } else if (step == 15) {
                    step += 2;
                } else {
                    step++;
                }
                this.setData({
                    step: step
                });
            }
        }, 500);
    },
    countScore() {
        var result = '';
        var resultDescription = [];
        var q = this.data.answers.q;
        var isRisk = false;
        this.result = 1;
        if (q[13] == 1) {
            result = '几乎没有任何体力活动';
            isRisk = true;
            this.result = 3;
        }
        if (q[13] == 2) {
            result = '有很少的体力活动';
            isRisk = true;
            this.result = 2;
        }
        if (q[13] == 3) {
            if (q[14] == 1) {
                result = '中等强度体力活动不足';
                this.result = 2;
                isRisk = true;
            }
            if (q[14] == 2) {
                result = '中等强度体力活动适宜';
            }
            if (q[14] == 3) {
                result = '中等强度体力活动充足';
            }
        }
        if (q[13] == 4) {
            if (q[15] == 1) {
                result = '高强度体力活动不足';
                this.result = 2;
                isRisk = true;
            }
            if (q[15] == 2) {
                result = '高强度体力活动适宜';
            }
            if (q[15] == 3) {
                result = '高强度体力活动充足';
            }
        }
        if (q[0] == 1 && q[1] < 5 || (q[0] == 2 || q[0] == 3) && q[1] < 4 || q[0] == 4 && q[1] < 3) {
            resultDescription.push('体育课活动时间不足');
        }
        if (q[3] == 1 && resultDescription.indexOf('体育课活动时间不足') == -1) {
            resultDescription.push('体育课活动时间不足');
        }
        if (q[5] == 1) {
            resultDescription.push('课间操活动时间不足');
        }
        if (q[6] == 1) {
            resultDescription.push('社会支持不足');
        }
        if (q[9] == 1 || q[9] == 2) {
            resultDescription.push('体育活动时间不足');
        }
        if (q[10] == 3 || q[10] == 4 && resultDescription.indexOf('社会支持不足') == -1) {
            resultDescription.push('社会支持不足');
        }
        if (q[11] == 1 && resultDescription.indexOf('社会支持不足') == -1) {
            resultDescription.push('社会支持不足');
        }
        if ((q[2] == 4 || q[2] == 5) &&
            (q[7] == 1 || q[7] == 2) &&
            (q[8] == 4 || q[8] == 5) &&
            (q[12] == 4 || q[12] == 5)) {
            resultDescription.push('运动意愿不强烈');
        }
        if (resultDescription.length) {
            isRisk = true;
        } else if (this.result == 1) {
            resultDescription.push('未发现存在活动水平问题');
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            isRisk: isRisk,
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
            type: 'FAT-ACTION',
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk
        };
        if (this.data.answers.q[16] === undefined) {
            wx.jyApp.toast('请填写锻炼年数');
            return;
        }
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
                    wx.jyApp.setTempData('act-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/act-result/index?result=${this.result}&_result=${this.data.result}`
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
        var step = this.data.step
        if (step == 16) {
            step = 14;
        } else if (step == 17) {
            if (this.data.answers.q[13] == 1 || this.data.answers.q[13] == 2) {
                step = 14;
            } else if (this.data.answers.q[13] == 3) {
                step = 15;
            } else {
                step--;
            }
        } else {
            step--;
        }
        this.setData({
            step: step
        });
    }
})