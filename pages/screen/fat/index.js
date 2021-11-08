const app = getApp()

Page({
    data: {
        filtrateFat: {
            id: '',
            patientId: '',
            _sex: '',
            sex: '',
            filtrateDate: '',
            stature: '',
            weight: '',
            BMI: '',
            WHtR: '',
            result: 1
        },
        minDate: new Date(1900, 0, 1).getTime(),
        maxDate: new Date().getTime(),
        sexVisible: false,
        dateVisible: false,
        filtrateDate: new Date().getTime()
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.patient = patient;
        this.from = option.from;
        patient._sex = patient.sex == 1 ? '男' : '女';
        if (!option.id) {
            this.setData({
                'filtrateFat.filtrateDate': new Date().formatTime('yyyy-MM-dd'),
                'filtrateFat.patientId': patient.id,
                'filtrateFat.sex': patient.sex,
                'filtrateFat._sex': patient._sex,
                'filtrateFat.stature': patient.height,
                'filtrateFat.weight': patient.weight,
                'filtrateFat.age': patient.birthday ? this.getAge(patient.birthday) : '',
            });
            this.setBMI();
            this.countScore();
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
    getAge(birthday) {
        birthday = birthday.split('-');
        var year = Number(birthday[0]);
        var month = Number(birthday[1]);
        var date = Number(birthday[2]);
        var now = new Date();
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth() + 1;
        var nowDate = now.getDate();
        var age = nowYear - year;
        if (nowMonth == month) {
            if (nowDate < date) {
                age -= 0.5;
            }
        } else if (nowMonth < month) {
            age--;
            if (12 - month + nowMonth > 6 || 12 - month + nowMonth == 6 && nowDate >= date) {
                age += 0.5;
            }
        } else if (nowMonth - month > 6 || nowMonth - month == 6 && nowDate >= date) {
            age += 0.5;
        }
        return age;
    },
    countScore() {
        var result1 = 1;
        var result2 = 1;
        var result3 = 1;
        // 方式一
        for (var i = 0; i < wx.jyApp.constData.overWeight.length; i++) {
            var item = wx.jyApp.constData.overWeight[i];
            if (this.data.filtrateFat.age >= item[0]) {
                result1 = 1;
                if (this.data.filtrateFat.sex == 1) {
                    if (this.data.filtrateFat.BMI >= item[1]) {
                        result1 = 2
                    }
                    if (this.data.filtrateFat.BMI >= item[2]) {
                        result1 = 3
                    }
                } else {
                    if (this.data.filtrateFat.BMI >= item[3]) {
                        result1 = 2
                    }
                    if (this.data.filtrateFat.BMI >= item[4]) {
                        result1 = 3
                    }
                }
            } else {
                break;
            }
        }
        // 方式二
        for (var i = 0; i < wx.jyApp.constData.waist.length; i++) {
            var item = wx.jyApp.constData.waist[i];
            if (Math.floor(this.data.filtrateFat.age) >= item[0]) {
                result2 = 1
                if (this.data.filtrateFat.sex == 1) {
                    if (this.data.filtrateFat.waist >= item[2]) {
                        result2 = 3
                    }
                } else {
                    if (this.data.filtrateFat.waist >= item[4]) {
                        result2 = 3
                    }
                }
            } else {
                break;
            }
        }
        // 方式三
        if (this.data.filtrateFat.WHtR >= 0.5) {
            result3 = 3;
        }
        var result = result1;
        if (result1 == 2 && result2 != 3 && result3 != 3) {
            result = 2;
        }
        if (result1 == 2 && (result2 == 3 || result3 == 3)) {
            result = 4;
        }
        // if (result1 == 3 && result2 != 3 && result3 != 3) {
        //     result = 3;
        // }
        // if (result1 == 3 && (result2 == 3 || result3 == 3)) {
        //     result = 5;
        // }
        this.setData({
            'filtrateFat.result': result
        });
    },
    setBMI() {
        var BMI = (this.data.filtrateFat.weight) / (this.data.filtrateFat.stature * this.data.filtrateFat.stature / 10000);
        var WHtR = this.data.filtrateFat.waist / this.data.filtrateFat.stature
        this.setData({
            'filtrateFat.BMI': BMI && isFinite(BMI) && BMI.toFixed(1) || '',
            'filtrateFat.WHtR': WHtR && isFinite(WHtR) && WHtR.toFixed(2) || ''
        });
    },
    onInputNum(e) {
        wx.jyApp.utils.onInputNum(e, this);
        this.setBMI();
        this.countScore();
    },
    onShowDate() {
        this.setData({
            dateVisible: true
        });
    },
    onShowSex() {
        this.setData({
            sexVisible: true
        });
    },
    onConfirmSex(e) {
        this.setData({
            'filtrateFat.sex': e.detail.index == 0 ? 2 : 1,
            'filtrateFat._sex': e.detail.value,
            sexVisible: false
        });
    },
    onConfirmDate(e) {
        var filtrateDate = new Date(e.detail).formatTime('yyyy-MM-dd');
        this.setData({
            'filtrateFat.filtrateDate': filtrateDate,
            dateVisible: false
        });
    },
    onCancel() {
        this.setData({
            dateVisible: false,
            sexVisible: false
        });
    },
    onSave() {
        var data = {
            ...this.data.filtrateFat
        }
        if (!this.data.filtrateFat.filtrateDate) {
            wx.jyApp.toast('请填写筛查日期');
            return;
        }
        if (!this.data.filtrateFat.sex) {
            wx.jyApp.toast('请填写性别');
            return;
        }
        if (!this.data.filtrateFat.stature) {
            wx.jyApp.toast('请填写身高');
            return;
        }
        if (!this.data.filtrateFat.weight) {
            wx.jyApp.toast('请填写体重');
            return;
        }
        wx.jyApp.showLoading('提交中...', true);
        if (this.from == 'screen') {
            this.save(data);
        } else {
            this.saveWithChat(data);
        }
    },
    save(data) {
        wx.jyApp.http({
            url: `/filtrate/fat/${this.data.filtrateFat.id ? 'update' : 'save'}`,
            method: 'post',
            data: data
        }).then(() => {
            var page = wx.jyApp.utils.getPageByLastIndex(2);
            if (page.route == 'pages/screen/screen-list/index') {
                page.onRefresh();
            }
            wx.jyApp.toastBack('保存成功', {
                mask: true,
                delta: 1,
                complete: () => {
                    var result = this.data.filtrateFat.result;
                    var _result = '体重正常';
                    if (result == 2) {
                        _result = '超重';
                    }
                    if (result == 3) {
                        _result = '肥胖';
                    }
                    if (result == 4) {
                        _result = '中心性肥胖（BMI超重）';
                    }
                    if (result == 5) {
                        _result = '中心性肥胖（BMI肥胖）';
                    }
                    wx.jyApp.utils.navigateTo({
                        url: `/pages/screen/fat-result/index?result=${result}&_result=${_result}&from=${this.from}`
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
                    filtrateType: 'FAT',
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
    loadInfo(id) {
        wx.jyApp.http({
            url: `/filtrate/fat/info/${id}`
        }).then((data) => {
            var filtrateFat = data.filtrateFat;
            filtrateFat._sex = filtrateFat.sex == 1 ? '男' : '女';
            filtrateFat.patientId = data.patientFiltrate.patientId;
            filtrateFat.filtrateDate = data.patientFiltrate.filtrateDate;
            this.data.filtrateDate = Date.prototype.parseDate(data.patientFiltrate.filtrateDate).getTime();
            this.setData({
                filtrateFat: filtrateFat,
                filtrateDate: this.data.filtrateDate
            });
            this.setBMI();
        });
    }
})