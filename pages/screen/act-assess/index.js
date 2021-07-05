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
            if (step == 16) {
                this.onSave();
            } else {
                if (step == 13) {
                    var anser = this.data.answers[12];
                    if (anser == 1 || anser == 2) {
                        step = 16
                    } else if (anser = 3) {
                        step++;
                    } else {
                        step += 2;
                    }
                } else if (step == 14) {
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
        if (q[12] = 1) {
            result = '几乎没有任何体力活动';
        }
        if (q[12] == 2) {
            result = '有很少的体力活动';
        }
        if (q[12 == 3]) {
            if (q[13] == 1) {
                result = '中等强度体力活动不足';
            }
            if (q[13] == 2) {
                result = '中等强度体力活动适宜';
            }
            if (q[13] == 3) {
                result = '中等强度体力活动充足';
            }
        }
        if (q[12] == 4) {
            if (q[14] == 1) {
                result = '高强度体力活动不足';
            }
            if (q[14] == 2) {
                result = '高强度体力活动适宜';
            }
            if (q[14] == 1) {
                result = '高强度体力活动充足';
            }
        }
        if (q[2] == 1) {
            resultDescription.push('体育课活动时间不足');
        }
        if (q[4] == 1) {
            resultDescription.push('课间操活动时间不足');
        }
        if (q[5] == 1) {
            resultDescription.push('社会支持不足');
        }
        if (q[8] == 1 || q[8] == 2 && resultDescription.indexOf('体育活动时间不足') == 1) {
            resultDescription.push('体育活动时间不足');
        }
        if (q[9] == 3 || q[9] == 4 && resultDescription.indexOf('社会支持不足') == 1) {
            resultDescription.push('社会支持不足');
        }
        if (q[10] == 1 && resultDescription.indexOf('社会支持不足') == 1) {
            resultDescription.push('社会支持不足');
        }
        if ((q[1] == 4 || q[1] == 5) &&
            (q[6] == 1 || q[6] == 2) &&
            (q[7] == 4 || q[7] == 5) &&
            (q[11] == 4 || q[11] == 5)) {
            resultDescription.push('运动意愿不强烈');
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';')
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
        this.countScore();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.patientId || this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-ACTION',
            result: this.data.result,
            resultDescription: this.data.resultDescription
        };
        if (this.data.answers.q[15] === undefined) {
            wx.jyApp.toast('请填写锻炼年数');
            return;
        }
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
                    var str = this.data.result.slice(0, 2);
                    if (str == '中等') {
                        result = 2;
                    }
                    if (str == '有很') {
                        result = 3;
                    }
                    if (str == '几乎') {
                        result = 4;
                    }
                    wx.jyApp.setTempData('act-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/act-result/index?result=${result}&_result=${this.data.result}`
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