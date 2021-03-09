Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    properties: {
        patient: {
            type: Object,
            value: {}
        },
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                if (newVal) {
                    wx.nextTick(() => {
                        this.onAdd();
                        this.loadList(true);
                    });
                }
            }
        }
    },
    data: {
        dateVisible: false,
        listVisible: false,
        choiceVisible: false,
        departVisible: false,
        userVisible: false,
        dataList: [],
        doctorName: '',
        departmentList: [],
        userList: [],
        receiveDepartmentName: '',
        receiveDepartment: '',
        receiverName: '',
        receiver: '',
        defaultDepartmentindex: 0,
        defaultUserindex: 0,
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function () {
        this._attached();
    },
    methods: {
        _attached() {
            var userInfo = wx.getStorageSync('mobileUserInfo');
            this.userInfo = userInfo;
            this.setData({
                doctorName: userInfo.name,
                receiveDepartmentName: userInfo.departmentName,
                receiveDepartment: userInfo.department,
                receiverName: userInfo.name,
                receiver: userInfo.id,
            });
            this.getDepartmentList();
            this.getUserList(true);
        },
        onInput(e) {
            wx.jyApp.utils.onInput(e, this);
            this.setBMI();
            this.countScore();
        },
        onShowList() {
            this.setData({
                listVisible: !this.data.listVisible
            });
        },
        onShowDate() {
            this.setData({
                dateVisible: true
            });
        },
        onConfirmDate(e) {
            var filtratedDate = new Date(e.detail).formatTime('yyyy-MM-dd');
            this.setData({
                'nrs.filtratedDate': filtratedDate,
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
            this.countScore();
        },
        onShowUserChoice() {
            this.setData({
                choiceVisible: !this.data.choiceVisible,
            });
        },
        onShowDepartment() {
            this.setData({
                departVisible: !this.data.departVisible,
            });
        },
        onShowUser() {
            this.setData({
                userVisible: !this.data.userVisible,
            });
        },
        onConfirmDepartment(e) {
            this.setData({
                receiveDepartmentName: e.detail.value.departmentName,
                receiveDepartment: e.detail.value.id,
                departVisible: false
            });
            this.getUserList();
        },
        onConfirmUser(e) {
            this.setData({
                receiverName: e.detail.value.name,
                receiver: e.detail.value.id,
                userVisible: false
            });
        },
        onCancelDepUser() {
            this.setData({
                departVisible: false,
                userVisible: false
            });
        },
        onConfirmChoice() {
            this.setData({
                choiceVisible: false,
            });
            this.sendRiskNotice = true;
            this.save();
        },
        onCancelChoice() {
            this.setData({
                choiceVisible: false,
            });
            this.sendRiskNotice = false;
            this.save();
        },
        onAdd() {
            this.setData({
                filtratedDate: new Date().getTime(),
                nrs: {
                    id: '',
                    filtratedDate: new Date().formatTime('yyyy-MM-dd'),
                    bmiLessThan: '',
                    stature: this.properties.patient.stature || '',
                    weight: this.properties.patient.weight || '',
                    BMI: '',
                    loseWeight: null,
                    foodIntake: null,
                    needNormal: null,
                    needAddition: null,
                    ageGe70: this.properties.patient.age >= 70 ? 1 : 0,
                    result: this.properties.patient.age >= 70 ? 1 : 0,
                    resultDescription: '建议每周重新评估患者的营养状况',
                }
            });
            this.setBMI();
            this.countScore();
        },
        onSetInfo(e) {
            var item = e.currentTarget.dataset.item;
            this.setInfo(item);
            this.setData({
                listVisible: false
            });
        },
        onDelete(e) {
            var id = e.currentTarget.dataset.id;
            wx.jyApp.dialog.confirm({
                message: '确认删除？'
            }).then(() => {
                wx.jyApp.showLoading('删除中...', true);
                wx.jyApp.http({
                    type: 'mobile',
                    method: 'get',
                    url: '/app/nutrition/delete',
                    data: {
                        method: 'nrs',
                        id: id
                    }
                }).then(() => {
                    wx.jyApp.toast('删除成功');
                    this.data.dataList = this.data.dataList.filter((item) => {
                        return item.id != id;
                    });
                    this.setData({
                        listVisible: false,
                        dataList: this.data.dataList
                    });
                    if (this.nowId == id) {
                        this.setInfo(this.data.dataList[0]);
                    }
                }).finally(() => {
                    wx.hideLoading();
                });
            });
        },
        setBMI() {
            if (this.data.nrs.stature && this.data.nrs.weight) {
                var BMI = _getBMI(this.data.nrs.stature, this.data.nrs.weight)
                this.setData({
                    'nrs.BMI': BMI,
                    'nrs.bmiLessThan': BMI < 18.5 ? 3 : 0
                });
            } else {
                this.setData({
                    'nrs.BMI': '',
                    'nrs.bmiLessThan': ''
                });
            }

            function _getBMI(stature, weight) {
                var BMI = (weight) / (stature * stature / 10000);
                BMI = BMI && BMI.toFixed(2) || '';
                return BMI || '';
            }
        },
        //计算总分
        countScore() {
            var result = [this.data.nrs.bmiLessThan, this.data.nrs.loseWeight, this.data.nrs.foodIntake].sort(function (a, b) {
                return a - b
            })[2];
            result = _getRealNum(result) + _getRealNum(this.data.nrs.needNormal) + _getRealNum(this.data.nrs.ageGe70);
            if(!_getRealNum(this.data.nrs.needNormal)) {
                result += _getRealNum(this.data.nrs.needAddition);
            }
            this.setData({
                'nrs.result': result,
                'nrs.resultDescription': result >= 3 ? '患者有营养风险，需进行营养支持治疗' : '建议每周重新评估患者的营养状况'
            });

            function _getRealNum(num) {
                return Number(num > 0 ? num : 0);
            }
        },
        loadList(refresh) {
            refresh && wx.jyApp.showLoading('加载中', true);
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'nrs',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient
                }
            }).then((data) => {
                data.result.rows.map((item) => {
                    item.originDate = item.filtratedDate;
                    item.filtratedDate = item.filtratedDate && new Date(item.filtratedDate).formatTime('yyyy-MM-dd') || ''
                });
                this.setData({
                    dataList: data.result.rows
                });
                if (!this.nowId) {
                    this.setInfo(data.result.rows[0]);
                }
            }).finally(() => {
                refresh && wx.hideLoading();
            });
        },
        //数据转换(兼容营养系统)
        setInfo(nrs) {
            if (!nrs) {
                return;
            }
            this.nowId = nrs.id;
            var data = {
                id: nrs.id,
                filtratedDate: nrs.filtratedDate,
                bmiLessThan: null,
                stature: nrs.stature,
                weight: nrs.weight,
                BMI: nrs.bmi,
                loseWeight: null,
                foodIntake: null,
                needNormal: null,
                needAddition: nrs.needAddition,
                ageGe70: nrs.ageGe70 ? 1 : 0,
                result: nrs.score,
                resultDescription: nrs.handle,
            }
            if (nrs.bmi) {
                data.bmiLessThan = nrs.bmiLessThan ? 3 : 0;
            }
            if (nrs.foodIntake) {
                data.foodIntake = 0;
            } else if (nrs.foodIntake1) {
                data.foodIntake = 1;
            } else if (nrs.foodIntake2) {
                data.foodIntake = 2;
            } else if (nrs.foodIntake3) {
                data.foodIntake = 3;
            }
            if (nrs.normalNutrition) {
                data.loseWeight = 0
            } else if (nrs.loseWeightOrFoodIntake1) {
                data.loseWeight = 1;
            } else if (nrs.loseWeightOrFoodIntake2) {
                data.loseWeight = 2;
            } else if (nrs.loseWeightOrFoodIntake3) {
                data.loseWeight = 3;
            }
            if (nrs.needNormal) {
                data.needNormal = 0;
            } else if (nrs.needSlightlyIncrease) {
                data.needNormal = 1;
            } else if (nrs.needModeratelyIncrease) {
                data.needNormal = 2;
            } else if (nrs.needSlightlyIncrease) {
                data.needNormal = 3;
            }
            this.setData({
                nrs: data,
                filtratedDate: nrs.originDate,
                doctorName: nrs.doctorName
            });
        },
        //数据转换(兼容营养系统)
        getSaveData() {
            var data = {
                ...this.data.nrs,
                inHospitalNumber: this.properties.patient.inHospitalNumber,
                isInpatient: this.properties.patient.isInpatient
            };
            if (this.sendRiskNotice) {
                data.receiveDepartment = this.data.receiveDepartment;
                data.receiveDepartmentName = this.data.receiveDepartmentName;
                data.receiverName = this.data.receiverName;
                data.receiver = this.data.receiver;
                data.sendNotification = true;
            }
            data.bmi = data.BMI;
            data.bmiLessThan = data.bmiLessThan == 3 ? true : false;
            data.ageGe70 = data.ageGe70 == 1 ? true : false;
            data.score = data.result;
            data.handle = data.resultDescription;
            var foodIntake = data.foodIntake;
            data.foodIntake = false;
            data.foodIntake1 = false;
            data.foodIntake2 = false;
            data.foodIntake3 = false;
            switch (foodIntake) {
                case 0:
                    data.foodIntake = true;
                    break;
                case 1:
                    data.foodIntake1 = true;
                    break;
                case 2:
                    data.foodIntake2 = true;
                    break;
                case 3:
                    data.foodIntake3 = true;
                    break;
            }
            data.normalNutrition = false;
            data.loseWeightOrFoodIntake1 = false;
            data.loseWeightOrFoodIntake2 = false;
            data.loseWeightOrFoodIntake3 = false;
            switch (data.loseWeight) {
                case 0:
                    data.normalNutrition = true;
                    break;
                case 1:
                    data.loseWeightOrFoodIntake1 = true;
                    break;
                case 2:
                    data.loseWeightOrFoodIntake2 = true;
                    break;
                case 3:
                    data.loseWeightOrFoodIntake3 = true;
                    break;
            }
            var needNormal = data.needNormal;
            data.needNormal = false;
            data.needSlightlyIncrease = false;
            data.needModeratelyIncrease = false;
            data.needSlightlyIncrease = false;
            //疾病状况
            switch (needNormal) {
                case 0:
                    data.needNormal = true;
                    break;
                case 1:
                    data.needSlightlyIncrease = true;
                    break;
                case 2:
                    data.needModeratelyIncrease = true;
                    break;
                case 3:
                    data.needSlightlyIncrease = true;
                    break;
            }
            return data;
        },
        onSave() {
            if (this.data.nrs.result > 2) {
                this.onShowUserChoice();
            } else {
                this.save();
            }
        },
        save() {
            var data = this.getSaveData();
            if (!data.filtratedDate) {
                wx.jyApp.toast('请填写筛查日期');
                return;
            }
            wx.jyApp.showLoading('加载中...', true);
            _save.bind(this)();

            function _save() {
                wx.jyApp.http({
                    type: 'mobile',
                    method: 'post',
                    url: '/app/nutrition/saveOrUpdate',
                    data: {
                        method: 'nrs',
                        params: JSON.stringify({
                            ...data
                        })
                    }
                }).then((_data) => {
                    wx.hideLoading();
                    wx.jyApp.toast('保存成功');
                    if (!data.id) {
                        this.setData({
                            'nrs.id': _data.result.data
                        });
                        this.nowId = _data.result.data;
                    }
                    this.loadList();
                }).catch(() => {
                    wx.hideLoading();
                }).finally(() => {
                    this.sendRiskNotice = false;
                });
            }
        },
        getDepartmentList() {
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'department',
                    pageNum: 1,
                    pageSize: 1000
                }
            }).then((data) => {
                var defaultDepartmentindex = 0;
                data.result.rows = data.result.rows || [];
                data.result.rows.map((item, index) => {
                    if (item.id == this.userInfo.department) {
                        defaultDepartmentindex = index;
                    }
                });
                this.setData({
                    departmentList: data.result.rows,
                    defaultDepartmentindex: defaultDepartmentindex
                });
            });
        },
        getUserList(isDefault) {
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'doctor',
                    departmentId: this.data.receiveDepartment,
                    pageNum: 1,
                    pageSize: 1000
                }
            }).then((data) => {
                data.result.rows = data.result.rows || [];
                if (!isDefault) {
                    this.setData({
                        receiverName: data.result.rows.length && this.data.userList[0].name || '',
                        receiver: data.result.rows.length && this.data.userList[0].id || '',
                    });
                    this.setData({
                        userList: data.result.rows,
                        defaultUserindex: 0
                    });
                } else {
                    var defaultUserindex = 0;
                    data.result.rows.map((item, index) => {
                        if (item.id == this.userInfo.id) {
                            defaultUserindex = index;
                        }
                    });
                    this.setData({
                        userList: data.result.rows,
                        defaultUserindex: defaultUserindex
                    });
                }
            });
        }
    }
})