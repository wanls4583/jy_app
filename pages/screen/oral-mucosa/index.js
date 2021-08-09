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
        var q = this.data.answers.q;
        var level3 = q[6] && q[6].length;
        var level2 = (q[5] && q[5].length || 0) + (q[4] && q[4].length || 0);
        var level1 = (q[3] && q[3].length || 0) + (q[2] && q[2].length || 0) + (q[1] == 2 ? 1 : 0) + (q[0] == 2 ? 1 : 0);
        // 高度风险
        if (level3 > 0 || level2 >= 2) {
            result = '高度风险患者';
            resultDescription = ['需进行高度风险患者预防措施'];
        } else if (level2 > 0 || level1 >= 3) {
            result = '中度风险患者';
            resultDescription = ['需进行中度风险患者预防措施'];
        } else if (level1 > 0) {
            result = '轻度风险患者';
            resultDescription = ['需进行轻度风险患者预防措施'];
        } else {
            result = '正常';
            resultDescription = ['暂未发现风险'];
        }
        this.setData({
            result: result,
            resultDescription: resultDescription.join(';'),
            isRisk: score > 2
        });
    },
    loadInfo(id) {
        return wx.jyApp.http({
            url: `/evaluate/common/info/${id}`,
        }).then((data) => {
            data.patientFiltrate = data.patientFiltrate || {};
            data.patientFiltrate._sex = data.patientFiltrate.sex == 1 ? '男' : '女';
            data.info.answers = JSON.parse(data.info.answers);
            data.patientFiltrate.id = data.patientFiltrate.patientId;
            this.setData({
                id: data.info.id || '',
                filtrateId: data.info.filtrateId || '',
                answers: data.info.answers,
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
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'ORAL_MUCOSA'
        };
        wx.jyApp.showLoading('加载中...', true);
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
                    wx.jyApp.setTempData('oral-mucosa-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/oral-mucosa-result/index?result=${result}&_result=${this.data.result}`
                    });
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
})