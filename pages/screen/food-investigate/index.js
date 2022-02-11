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
        resultMap: [{
            0: '粗粮类食物摄入不足，主食品种单一',
            1: '粗粮类食物摄入不足'
        }, {
            0: '粗粮类食物摄入不足，主食品种单一'
        }, {
            0: '粗粮类食物摄入不足，主食品种单一'
        }, {
            0: '禽肉类摄入量不足'
        }, {
            0: '海鲜类食物摄入严重不足',
            1: '海鲜类食物摄入不足'
        }, {
            0: '蔬菜摄入量严重不足',
            1: '蔬菜摄入种类单一'
        }, {
            0: '深色叶类蔬菜摄入量严重不足',
            2: '深色叶类蔬菜摄入量不足'
        }, {
            0: '蛋类摄入量严重不足',
            2: '蛋类摄入量不足'
        }, {
            0: '水果摄入严重不足',
            2: '水果摄入不足'
        }, {
            0: '水果摄入严重不足',
            2: '水果摄入不足'
        }, {
            0: '奶类及乳制品摄入频率严重不足',
            1: '奶类及乳制品摄入频率不足'
        }, {
            0: '奶类及乳制品摄入量不足'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '含糖饮食摄入量较高',
            0: '含糖饮食摄入量过高'
        }, {
            2: '甜食摄入频率较高',
            0: '甜食摄入频率过高'
        }, {
            0: '含糖饮食摄入频率较高'
        }, {
            0: '含糖饮食摄入频率较高'
        }, {
            2: '低营养高能量饮食摄入量较高',
            0: '低营养高能量饮食摄入量过高'
        }, {
            0: '低营养高能量饮食摄入量过高'
        }, {
            0: '低营养高盐饮食摄入量过高'
        }, {
            0: '低营养高脂肪食物摄入频率过高'
        }, {
            0: '饱和脂肪酸摄入量过高'
        }, {
            0: '饱和脂肪酸摄入量过高'
        }, {
            3: '餐次安排不合理'
        }, {
            3: '睡前进食'
        }, {
            0: '过度喂养和过量进食'
        }, {
            3: '外出就餐过频',
            4: '外出就餐过频'
        }, {
            2: '饮食口味偏重',
            3: '饮食口味偏重',
            4: '饮食口味偏重',
            5: '饮食口味偏重',
            6: '饮食口味偏重'
        }]
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
            if (step == 29) {
                this.onSave();
            } else {
                this.setData({
                    step: step + 1
                });
            }
        }, 500);
    },
    countResult() {
        var score = 0;
        var resultDescription = [];
        this.data.answers.q.map((item, i) => {
            if (item !== undefined) {
                score += item;
                if (this.data.resultMap[i][item] && resultDescription.indexOf(this.data.resultMap[i][item]) == -1) {
                    resultDescription.push(this.data.resultMap[i][item]);
                }
            }
        });
        var result = '';
        if (score < 60) {
            result = '膳食营养有风险';
        } else if (score <= 75) {
            result = '膳食营养风险可疑';
        } else if (this.data.answers.q.length) {
            result = '膳食营养无风险';
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            isRisk: result && result != '膳食营养无风险',
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
        });
    },
    onSave() {
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            type: 'FAT-DIET',
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
        }).then((_data) => {
            data.filtrateId = data.filtrateId || _data.filtrateId;
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    if (this.data.result == '膳食营养风险可疑') {
                        result = 2;
                    }
                    if (this.data.result == '膳食营养有风险') {
                        result = 3
                    }
                    wx.jyApp.setTempData('results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/fat-result/index?result=${result}&_result=${this.data.result}&patientId=${this.data.patientId}&consultOrderId=${this.data.consultOrderId}&from=${this.from}&roomId=${this.roomId}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}`
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
                    filtrateType: 'FAT-DIET',
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