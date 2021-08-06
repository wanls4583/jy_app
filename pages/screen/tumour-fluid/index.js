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
            'q[3]': eat
        });
    },
    countResult() {
        var score = 0;
        var result = '';
        var resultDescription = [];
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
        temp = 10 - q[3];
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
        } else if (score >= 5) {
            result = '恶液质期';
        } else if (score >= 3) {
            result = '恶液质前期';
        } else if (q.length) {
            result = '无恶液质';
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
            data.fatEvaluate.answers = JSON.parse(data.fatEvaluate.answers);
            data.patientFiltrate.id = data.patientFiltrate.patientId;
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
        this.countResult();
        var data = {
            id: this.data.id,
            filtrateId: this.data.filtrateId,
            patientId: this.data.patient.id,
            answers: JSON.stringify(this.data.answers),
            result: this.data.result,
            resultDescription: this.data.resultDescription,
            isRisk: this.data.isRisk,
            type: 'TUNOUR_FLUID'
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
                    if (this.data.result == '恶液质前期') {
                        result = 2;
                    }
                    if (this.data.result == '恶液质期') {
                        result = 3;
                    }
                    if (this.data.result == '恶液质难治期') {
                        result = 4;
                    }
                    wx.jyApp.setTempData('tumour-fluid-results', this.data.resultDescription.split(';'));
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/tumour-fluid-result/index?result=${result}&_result=${this.data.result}`
                    });
                }
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
})