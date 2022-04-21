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
        eatArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.share = option.share || '';
        // 患者通过筛查选择页面进入
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
        this.setData({
            [`${prop}`]: e.detail,
        });
    },
    onBack() {
        this.setData({
            step: this.data.step - 1
        });
    },
    onNext() {
        this.setData({
            step: this.data.step + 1
        });
    },
    onEat(e) {
        var eat = e.currentTarget.dataset.item;
        this.setData({
            'answers.q[3]': eat
        });
    },
    countResult() {
        var score = 0;
        var result = '';
        var resultDescription = [];
        var _resultDescription = '';
        var q = this.data.answers.q;
        var temp = 0;
        score += (q[0] || 0);
        q[1] && q[1].map((item) => {
            temp += (item || 0);
        });
        if (temp >= 1 && temp <= 3) {
            score += 1;
        } else if (temp >= 4 && temp <= 6) {
            score += 2;
        } else if (temp >= 7) {
            score += 3;
        }
        if (q[2] >= 1 && q[2] <= 2) {
            score += 1;
        } else if (q[2] >= 3) {
            score += 2
        }
        temp = 10 - (q[3] === null ? 10 : q[3]);
        if (temp >= 4 && temp <= 6) {
            score += 1;
        } else if (temp >= 7) {
            score += 2;
        }
        temp = q[4] || [];
        temp = (temp[0] || 0) + (temp[1] || 0) + (temp[2] || 0);
        if (temp == 1) {
            score += 1;
        } else if (temp > 1) {
            score += 2;
        }
        if (score >= 9) {
            result = '恶液质难治期';
            resultDescription.push('推荐恶液质难治期的评估结果干预建议');
            _resultDescription = `评估结果干预建议：
            1、营养干预主要目标是减轻恶液质相关症状、提高整体生存质量。
            2、在难治性恶液质期，营养干预可能无法完全逆转其体质量减轻及代谢异常。
            3、需考虑营养干预带来的风险和负担可能超过其潜在益处，但适当的营养摄入仍可能改善患者生存质量，并给患者及家属带来心理安慰。
            4、由专业营养师（配合临床医师）进行的密切随访（包括关注营养状况、营养咨询和饮食指导）可能提高患者生存质量，甚至延长患者生存期。
            5、对于难治性恶液质阶段的患者，在不增加进食相关不适的情况下，可给予肠内营养，但是当存在系统性炎症时，单纯通过肠内营养恢复体质量比较困难。`;
        } else if (score >= 5) {
            result = '恶液质期';
            resultDescription.push('推荐恶液质期的评估结果干预建议');
            _resultDescription = `评估结果干预建议：
            1、恶液质营养干预的最终目标是逆转患者体质量减轻和肌肉丢失。
            2、由专业营养师（配合临床医师）进行的密切随访（包括关注营养状况、营养咨询和饮食指导）从而增加能量和蛋白质的摄入，改善肿瘤患者的营养状况。
            3、以下3种情况建议给予肠内营养从而提高或维持营养状况：
            （1）摄入不足导致的体质量减轻；
            （2）预计7天不能进食；
            （3）超过10天进食量不足每日推荐量60%。
            4、针对进展期恶性肿瘤患者，营养治疗应以肠内营养优先，肠外营养为辅，内外结合，内外转换。
            （1）短期肠外营养可针对性地提供给部分患者，如患有可逆性肠梗阻、短肠综合征或其他导致吸收不良的疾病。
            5、对各期恶液质患者，除营养支持外的非药物治疗，推荐包括鼓励适当锻炼、心理干预等。`;
        } else if (score >= 3) {
            result = '恶液质前期';
            resultDescription.push('推荐恶液质前期的评估结果干预建议');
            _resultDescription = `评估结果干预建议：
            1、营养干预的目标是增加患者能量及各种营养素的摄入，改善患者营养状况，调节肿瘤患者的异常代谢，最终逆转患者体质量减轻和肌肉丢失。
            2、为患者及家属提供实用和安全的营养建议；提供关于摄入高蛋白、高热量、高营养型食物的指导；以及修正任何未经证实的或极端的饮食建议。
            3、对于患者不能摄入足够固体食物满足营养需求时，建议补充营养剂，以ONS为首选。
            4、对各期恶液质患者，除营养支持外的非药物治疗，推荐包括鼓励适当锻炼、心理干预等。`;
        } else {
            result = '无恶液质';
            resultDescription.push('推荐无恶液质的评估结果干预建议');
            _resultDescription = `评估结果干预建议：
            1、结合PG-SGA量表总评分确定相应的营养干预措施，包括对病人及家属的教育指导、针对症状的治疗手段、恰当的营养支持。
            2、对患者及其家庭成员进行膳食营养指导，使患者了解自己的营养目标，并知道如何达到预期膳食摄入目标，以避免治疗过程中出现体重丢失或导致治疗的中断。`;
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            _resultDescription: _resultDescription,
            isRisk: score >= 3
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/evaluate/common/info/${id}`,
        }).then((data) => {
            data.info = data.info || {};
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            var filtrateId = data.patientFiltrate.id;
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                id: data.info.id || '',
                filtrateId: filtrateId,
                patient: data.patientFiltrate
            });
            if (data.info.answers) {
                data.info.answers = JSON.parse(data.info.answers);
                this.setData({
                    answers: data.info.answers,
                });
            }
            if (data.info.answers.filtrateDate) {
                this.setData({
                    filtrateDate: Date.prototype.parseDate(data.info.answers.filtrateDate)
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
            doctorId: this.doctorId,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'TUNOUR_FLUID'
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
        }).then((_data) => {
            data.filtrateId = data.filtrateId || _data.filtrateId;
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = 1;
                    if (this.data.result == '恶液质前期') {
                        result = 2;
                    }
                    if (this.data.result == '恶液质期') {
                        result = 3;
                    }
                    if (this.data.result == '恶液质难治期') {
                        result = 4;
                    }
                    if (this.data.userInfo.role != 'DOCTOR') {
                        wx.jyApp.setTempData('evaluate-results', [this.data._resultDescription]);
                        wx.jyApp.utils.navigateTo({
                            url: `/pages/screen/evaluate-result/index?title=肿瘤恶液质评估&result=${result}&_result=${this.data.result}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}`
                        });
                    }
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
                    filtrateType: 'TUNOUR_FLUID',
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
    }
})