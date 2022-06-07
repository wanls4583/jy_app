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
        now: 0
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
            now: 0,
            'answers.q[1]': 0
        });
    },
    onClickImg(e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            now: num,
            [`answers.q[1]`]: num
        });
    },
    countResult() {
        let result = this.data.answers.q[1] || 0;
        let resultDescription = '';
        result = result - 0;
        switch (result) {
            case 1:
                resultDescription = '营养教育;口服营养补充（ONS);补充型肠外营养（SPN）、早期肠内营养（EEN）、肠内管道喂养（TF）、全肠外营养（TPN）';
                break;
            case 2:
                resultDescription = '营养教育;口服营养补充（ONS);补充型肠外营养（SPN）、早期肠内营养（EEN）、肠内管道喂养（TF）';
                break;
            case 3:
                resultDescription = '营养教育;口服营养补充（ONS);补充型肠外营养（SPN）';
                break;
            case 4:
                resultDescription = '营养教育;口服营养补充（ONS)';
                break;
            case 5:
                resultDescription = '营养教育;口服营养补充（ONS)';
                break;
        }
        this.setData({
            result: result,
            resultDescription: resultDescription
        });

    },
    onBack() {
        this.setData({
            step: this.data.step - 1
        });
    },
    onNext() {
        if (this.data.step == 1 && !this.data.answers.q[0]) {
            wx.jyApp.toast('请选择你的主食类型');
            return;
        }
        this.setData({
            step: this.data.step + 1
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
            this.doctorId = data.patientFiltrate.doctor || '';
            this.setData({
                id: data.info.id || '',
                filtrateId: filtrateId,
                patient: data.patientFiltrate
            });
            if (data.info.answers) {
                let now = 0;
                data.info.answers = JSON.parse(data.info.answers);
                now = data.info.answers.q[1] || 0;
                this.setData({
                    answers: data.info.answers,
                    now: now
                });
                if (data.info.answers.filtrateDate) {
                    this.setData({
                        filtrateDate: Date.prototype.parseDate(data.info.answers.filtrateDate)
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
        const url= `/pages/screen/diet-self-result/index?&result=${this.data.result}&share=${this.share}&filtrateId=${data.filtrateId}&filtrateType=${data.type}`
        wx.jyApp.setTempData('evaluate-results', this.data.resultDescription.split(';'));
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
        if (!this.data.answers.q[1]) {
            wx.jyApp.toast('请选择最近一周进食情况')
            return;
        }
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
            type: 'DIET_SELF_CHECK'
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
            url: `/evaluate/common/${this.data.id?'update':'save'}`,
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
                    filtrateType: 'DIET_SELF_CHECK',
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