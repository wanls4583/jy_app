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
            q: [1],
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
        if (prop == 'answers.q[0]') {
            this.setData({
                'answers.q': [e.detail]
            });
        } else {
            this.setData({
                [`${prop}`]: e.detail,
            });
        }
    },
    countResult() {
        var score = 0;
        var result = '';
        var resultDescription = [];
        var explain = '';
        var suggestion = '';
        var q = this.data.answers.q;
        q.map((item, index) => {
            if (index > 0) {
                score += Number(item || 0);
            }
        });
        if (score <= 1) {
            result = '正常';
            resultDescription.push('暂未发现风险');
            suggestion = '需进行NRS-2002营养风险筛查';
        } else {
            result = '有营养风险';
            resultDescription.push('需要进行营养干预');
            suggestion = '需要进行营养干预';
        }
        if (q[0] == 1) {
            explain = `1、放疗患者应进行NRS-2002营养风险筛查，以尽早识别存在的营养风险。
            2、筛查时机：放疗前筛查、放疗中每周进行复查。
            3、必要时可进一步进行PＧ⁃ＳＧＡ营养评估 。
            4、RＴＯＧ 急性放射损伤作为放疗专科工具，其内容涵盖了对黏膜、食管、唾液腺等影响营养摄入因素的评级，为营养干预提供进一步的依据
            5、以下情况请联系主管医生或转诊临床营养科
            （1） ＮＲＳ⁃２００２≥3分时，说明存在营养风险。
            （2） 与营养相关的6项 ＲＴＯＧ急性放射损伤单项出现≥２ 级，则应立即给予营养干预。
            （3） 若与营养相关的6 项 ＲＴＯＧ急性放射损伤2项以上出现≥1 级，则应给予营养干预。`;
        } else {
            explain = `1、放疗后的营养随访建议每２～４周１次，持续３个月，或直至放疗引起的慢性不良反应、体重丢失或鼻饲管等问题得到妥善解决为止。
            2、建议每月进行一次NRS-2002营养风险筛查。
            3、建议同时进行ＲＴＯＧ晚期放射损伤放射损伤评估。
            4、以下情况请联系主管医生或转诊临床营养科
            （1） ＮＲＳ⁃２００２≥3分时，说明存在营养风险。
            （2） 与营养相关的５项ＲＴＯＧ晚期放射损伤单项出现≥２级，则应立即给与营养干预。
            （3） 与营养相关的５项ＲＴＯＧ晚期放射损伤出现2项以上≥1级，则应给与营养干预。`;
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            explain: explain,
            suggestion: suggestion,
            isRisk: score >= 2
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
                if (data.info.answers.filtrateDate) {
                    this.setData({
                        filtrateDate: Date.prototype.parseDate(data.info.answers.filtrateDate)
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
            doctorId: this.doctorId,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'X_INJURY'
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
                    if (this.data.result == '有营养风险') {
                        result = 4;
                    }
                    // if (this.data.userInfo.role != 'DOCTOR') {
                        wx.jyApp.setTempData('evaluate-results', [this.data.explain]);
                        wx.jyApp.utils.navigateTo({
                            url: `/pages/screen/evaluate-result/index?title=放射性损伤评估&result=${result}&_result=${this.data.result}&suggestion=${this.data.suggestion}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}`
                        });
                    // }
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
                    filtrateType: 'X_INJURY',
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