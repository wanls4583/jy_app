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
        eatArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
                'answers.q[0]': patient.sex == 1 ? 1 : 2,
                'answers.q[1]': patient.age < 60 ? 1 : 2,
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
        var value = e.detail;
        var index = prop.match(/\d+/);
        if (value instanceof Array) {
            var noneIndex = value.indexOf('-1');
            if (noneIndex > -1) {
                if (this.data.answers.q[index] && this.data.answers.q[index].indexOf('-1') == -1) {
                    value = ['-1'];
                } else {
                    value.splice(noneIndex, 1);
                }
            }
        }
        this.setData({
            [`${prop}`]: value,
        });
    },
    countResult() {
        var score = 0;
        var result = '';
        var resultDescription = [];
        var _resultDescription = '';
        var q = this.data.answers.q;
        var level3 = q[6] && q[6].length;
        var level2 = (q[5] && q[5].length || 0) + (q[4] && q[4].length || 0);
        var level1 = (q[3] && q[3].length || 0) + (q[2] && q[2].length || 0) + (q[1] == 2 ? 1 : 0) + (q[0] == 2 ? 1 : 0);
        if (q[6] && q[6][0] == -1) {
            level3--;
        }
        if (q[5] && q[5][0] == -1) {
            level2--;
        }
        if (q[4] && q[4][0] == -1) {
            level2--;
        }
        if (q[3] && q[3][0] == -1) {
            level1--;
        }
        if (q[2] && q[2][0] == -1) {
            level1--;
        }
        // 高度风险
        if (level3 > 0 || level2 >= 2) {
            result = '高度风险患者';
            resultDescription = ['需进行高度风险患者预防措施'];
            _resultDescription = `1、每日自我评估口腔情况，有异常变化及时告知医护人员。
			2、戒烟、戒酒。
			3、避免进食尖锐、粗糙、辛辣、过咸、过酸、过热等易损伤或刺激口腔黏膜的食物。
			4、做好基础口腔护理：
			（1）进食后和睡前使用软毛牙刷刷牙，宜用含氟牙膏，至少 2 次/d。牙刷刷头向上放置储存， 每月至少更换 1 次牙刷。
			（2）使用不含酒精的溶液漱口，如生理盐水或 3%～5%碳酸氢钠溶液，至少 2 次/d；使用漱口液时应先含漱，再鼓漱，时间至少 1 min。
			（3）治疗期间禁用牙线和牙签。
			5、增加生理盐水或 3%～5%碳酸氢钠溶液漱口频次，至少 4 次/d。
			6、宜在治疗前指前往口腔科筛查及治疗口腔基础疾患。
			7、使用半衰期短的化疗药物时，用药前开始含冰片、冰水等保持口腔低温 30 min；奥沙利铂化疗期间应避免使用口腔冷疗。
			8、用清水漱口后，再使用药物漱口液或口腔黏膜保护剂。
			9、应在中度风险预防措施的基础上进一步加强。
			10、可使用不同机制的药物漱口液，使用不同药物时至少间隔 30 min。
			11、使用低剂量激光治疗时，应根据仪器使用说明调节波长和照射时间。
			12、使用重组人角质细胞生长因子时，应正确配置并指导患者每次含漱 3 min，至少 4 次/d。`;
        } else if (level2 > 0 || level1 >= 3) {
            result = '中度风险患者';
            resultDescription = ['需进行中度风险患者预防措施'];
            _resultDescription = `1、每日自我评估口腔情况，有异常变化及时告知医护人员。
			2、戒烟、戒酒。
			3、避免进食尖锐、粗糙、辛辣、过咸、过酸、过热等易损伤或刺激口腔黏膜的食物。
			4、 做好基础口腔护理：
			（1）进食后和睡前使用软毛牙刷刷牙，宜用含氟牙膏，至少 2 次/d。牙刷刷头向上放置储存， 每月至少更换 1 次牙刷。
			（2） 使用不含酒精的溶液漱口，如生理盐水或 3%～5%碳酸氢钠溶液，至少 2 次/d；使用漱口液时应先含漱，再鼓漱，时间至少 1 min。
			（3）治疗期间禁用牙线和牙签。
			5、增加生理盐水或 3%～5%碳酸氢钠溶液漱口频次，至少 4 次/d。
			6、宜在治疗前指前往口腔科筛查及治疗口腔基础疾患。
			7、使用半衰期短的化疗药物时，用药前开始含冰片、冰水等保持口腔低温 30 min；奥沙利铂化疗期间应避免使用口腔冷疗。
			8、用清水漱口后，再使用药物漱口液或口腔黏膜保护剂。`;
        } else if (level1 > 0) {
            result = '轻度风险患者';
            resultDescription = ['需进行轻度风险患者预防措施'];
            _resultDescription = `1、每日自我评估口腔情况，有异常变化及时告知医护人员。
			2、戒烟、戒酒。
			3 、避免进食尖锐、粗糙、辛辣、过咸、过酸、过热等易损伤或刺激口腔黏膜的食物。
			4 、做好基础口腔护理：
			（1） 进食后和睡前使用软毛牙刷刷牙，宜用含氟牙膏，至少 2 次/d。牙刷刷头向上放置储存， 每月至少更换 1 次牙刷。
			（2） 使用不含酒精的溶液漱口，如生理盐水或 3%～5%碳酸氢钠溶液，至少 2 次/d；使用漱口液时应先含漱，再鼓漱，时间至少 1 min。
			（3） 治疗期间禁用牙线和牙签。`;
        } else {
            result = '正常';
            resultDescription = ['暂未发现风险'];
            _resultDescription = `暂未发现风险`;
        }
        if (result != '正常') {
            _resultDescription = result + '\n' + _resultDescription;
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            _resultDescription: _resultDescription,
            isRisk: level1 > 0
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/evaluate/common/info/${id}`,
        }).then((data) => {
            data.info = data.info || {};
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                id: data.info.id || '',
                filtrateId: data.info.filtrateId || '',
                patient: data.patientFiltrate
            });
            if (data.info.answers) {
                data.info.answers = JSON.parse(data.info.answers);
                this.setData({
                    answers: data.info.answers,
                });
                if (data.info.answers.filtrateDate) {
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
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'ORAL_MUCOSA'
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
            url: `/evaluate/common/${this.data.id?'update':'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    if (this.data.result == '轻度风险患者') {
                        result = 2;
                    }
                    if (this.data.result == '中度风险患者') {
                        result = 3;
                    }
                    if (this.data.result == '高度风险患者') {
                        result = 4;
                    }
                    wx.jyApp.setTempData('evaluate-results', [this.data._resultDescription]);
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/evaluate-result/index?title=口腔黏膜风险评估&result=${result}&_result=${this.data.result}`
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
                    filtrateType: 'ORAL_MUCOSA',
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
    }
})