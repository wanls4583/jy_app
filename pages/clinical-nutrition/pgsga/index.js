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
        filtratedDate: null,
        pgsga: {},
        dataList: [],
        doctorName: '',
        dateVisible: false,
        listVisible: false,
        choiceVisible: false,
        departVisible: false,
        userVisible: false,
        departmentList: [],
        userList: [],
        receiveDepartmentName: '',
        receiveDepartment: '',
        receiverName: '',
        receiver: '',
        defaultDepartmentindex: 0,
        defaultUserindex: 0,
        step: 1,
        weightChangeScoreMap: {
            'NO_CHANGE': 0,
            'MORE_THAN_BEFORE': 0,
            'LESS_THAN_BEFORE': 1,
        },
        dieteticChangeScoreMap: {
            'FEED_NORMAL': 0,
            'NORMAL_FEED': 1,
            'SOLID_FEED': 2,
            'FLUID_FEED': 3,
            'ONLY_NUTRITION': 3,
            'LITTLE_FEED': 4,
            'INJECTABLE_FEED': 0,
        },
        appetiteChangeScoreMap: {
            'NO_CHANGE': 0,
            'MORE': 0,
            'LESS': 1,
        },
        symptomScoreMap: {
            '恶心': 1,
            '呕吐': 3,
            '便秘': 1,
            '腹泻': 3,
            '口腔溃疡': 2,
            '口干': 1,
            '吞咽困难': 2,
            '容易饱胀': 1,
            '没有饮食方面的问题': 0,
            '没有食欲': 3,
            '有怪味困扰着我': 1,
            '吃起来感觉没有味道': 1,
            '何处疼痛': 3,
            '其他': 1,
        },
        physicalConditionScoreMap: {
            'NORMAL': 0,
            'DIFFERENT': 1,
            'UNCOMFORTABLE': 2,
            'LITTLE_MOTION': 3,
            'IN_BED': 3,
        },
        mainDeseasePeriodMap: {
            '1级': 1,
            '2级': 2,
            '3级': 3,
            '4级': 4,
        }
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
        onNext() {
            this.setData({
                step: this.data.step + 1
            });
        },
        onPre() {
            this.setData({
                step: this.data.step - 1
            });
        },
        onInput(e) {
            wx.jyApp.utils.onInputPlainText(e, this);
            this.countScore();
        },
        onInputNum(e) {
            wx.jyApp.utils.onInputNum(e, this);
            this.countScore();
            switch (parseInt(this.data.pgsga.otherMainDeseasePeriod)) {
                case 1:
                    this.setData({
                        'pgsga.mainDeseasePeriod': '1级'
                    })
                    break;
                case 2:
                    this.setData({
                        'pgsga.mainDeseasePeriod': '2级'
                    })
                    break;
                case 3:
                    this.setData({
                        'pgsga.mainDeseasePeriod': '3级'
                    })
                    break;
                case 4:
                    this.setData({
                        'pgsga.mainDeseasePeriod': '4级'
                    })
                    break;
                default:
                    this.setData({
                        'pgsga.mainDeseasePeriod': '其他'
                    })
                    break;
            }
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
                'pgsga.filtratedDate': filtratedDate,
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
            if (prop == 'pgsga.mainDeseasePeriod') {
                this.setData({
                    'pgsga.otherMainDeseasePeriod': this.data.mainDeseasePeriodMap[e.detail]
                });
            }
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
                pgsga: {
                    id: '',
                    aGrade: '',
                    bGrade: '',
                    cGrade: '',
                    dGrade: '',
                    filtratedDate: new Date().formatTime('yyyy-MM-dd'),
                    currentWeight: this.properties.patient.weight || '',
                    currentStature: this.properties.patient.stature || '',
                    weightOneMouthAgo: '',
                    weightSixMouthAgo: '',
                    weightChange: '',
                    dieteticChange: [],
                    appetiteChange: '',
                    symptom: [],
                    wherePained: '',
                    other: '',
                    physicalCondition: '',
                    mainDiagnosis: '',
                    mainDeseasePeriod: '',
                    otherMainDeseasePeriod: '',
                    metabolismStatus1: null,
                    metabolismStatus2: null,
                    metabolismStatus3: null,
                    fatOfCheek: null,
                    fatOfTriceps: null,
                    fatOfRib: null,
                    fatOfLack: null,
                    muscleOfTempora: null,
                    muscleOfCollarbone: null,
                    muscleOfShoulder: null,
                    muscleBewteenBones: null,
                    muscleOfScapula: null,
                    muscleOfThigh: null,
                    muscleOfLowerLeg: null,
                    muscleOfTotalGrade: null,
                    edemaOfAnkle: null,
                    edemaOfShin: null,
                    edemaOfAbdominal: null,
                    edemaOfTotalGrade: null,
                    _result: 'A',
                    result: 0
                }
            });
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
                        method: 'pgsga',
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
        //计算总分
        countScore() {
            var self = this;
            var pgsga = this.data.pgsga;
            var aGrade = _countStep1() + _countStep2() + _countStep3() + _countStep4();
            var bGrade = _countStep5();
            var cGrade = _countStep6();
            var dGrade = _countStep7() + _countStep8() + _countStep9();
            var count = aGrade + bGrade + cGrade + dGrade;
            this.setData({
                'pgsga.result': count,
                'pgsga.aGrade': aGrade,
                'pgsga.bGrade': bGrade,
                'pgsga.cGrade': cGrade,
                'pgsga.dGrade': dGrade,
            });
            this.setResult(count);

            function _countStep1() {
                var count = 0;
                var percent = 0;
                if (pgsga.currentWeight && pgsga.weightOneMouthAgo) {
                    percent = (pgsga.weightOneMouthAgo - pgsga.currentWeight) / pgsga.weightOneMouthAgo;
                    if (percent >= 0.1) {
                        count += 4;
                    } else if (percent >= 0.05) {
                        count += 3;
                    } else if (percent >= 0.03) {
                        count += 2;
                    } else if (percent >= 0.02) {
                        count += 1;
                    }
                } else if (pgsga.currentWeight && pgsga.weightSixMouthAgo) {
                    percent = (pgsga.weightSixMouthAgo - pgsga.currentWeight) / pgsga.weightSixMouthAgo;
                    if (percent >= 0.2) {
                        count += 4;
                    } else if (percent >= 0.1) {
                        count += 3;
                    } else if (percent >= 0.06) {
                        count += 2;
                    } else if (percent >= 0.02) {
                        count += 1;
                    }
                }
                return count + (self.data.weightChangeScoreMap[pgsga.weightChange] || 0);
            }

            function _countStep2() {
                var count = 0;
                //饮食中最大的分数计入总分
                pgsga.dieteticChange.map(item => {
                    if (self.data.dieteticChangeScoreMap[item] > count) {
                        count = self.data.dieteticChangeScoreMap[item];
                    }
                });
                if (count <= self.data.appetiteChangeScoreMap[pgsga.appetiteChange]) {
                    count = self.data.appetiteChangeScoreMap[pgsga.appetiteChange]
                }
                return count;
            }

            function _countStep3() {
                var count = 0;
                pgsga.symptom.map(item => {
                    count += self.data.symptomScoreMap[item]
                });
                return count;
            }

            function _countStep4() {
                return self.data.physicalConditionScoreMap[pgsga.physicalCondition] || 0;
            }

            function _countStep5() {
                return parseInt(pgsga.otherMainDeseasePeriod) || 0;
            }

            function _countStep6() {
                return (parseInt(pgsga.metabolismStatus1) || 0) + (parseInt(pgsga.metabolismStatus2) || 0) + (parseInt(pgsga.metabolismStatus3) || 0);
            }

            function _countStep7() {
                var fatCount = [{
                    score: 0,
                    num: 0
                }, {
                    score: 1,
                    num: 0
                }, {
                    score: 2,
                    num: 0
                }, {
                    score: 3,
                    num: 0
                }];
                if (fatCount[pgsga.fatOfCheek]) {
                    fatCount[pgsga.fatOfCheek].num++;
                }
                if (fatCount[pgsga.fatOfTriceps]) {
                    fatCount[pgsga.fatOfTriceps].num++;
                }
                if (fatCount[pgsga.fatOfRib]) {
                    fatCount[pgsga.fatOfRib].num++;
                }
                //分数个数最多的分数计入总分
                fatCount.sort((arg1, arg2) => {
                    return arg1.num - arg2.num;
                });
                var score = fatCount[3].num && fatCount[3].score || 0;
                if (fatCount[3].num) {
                    self.setData({
                        'pgsga.fatOfLack': score
                    });
                }
                return score;
            }

            function _countStep8() {
                var muscleCount = [{
                    score: 0,
                    num: 0
                }, {
                    score: 1,
                    num: 0
                }, {
                    score: 2,
                    num: 0
                }, {
                    score: 3,
                    num: 0
                }];
                if (muscleCount[pgsga.muscleOfTempora]) {
                    muscleCount[pgsga.muscleOfTempora].num++;
                }
                if (muscleCount[pgsga.muscleOfCollarbone]) {
                    muscleCount[pgsga.muscleOfCollarbone].num++;
                }
                if (muscleCount[pgsga.muscleOfShoulder]) {
                    muscleCount[pgsga.muscleOfShoulder].num++;
                }
                if (muscleCount[pgsga.muscleBewteenBones]) {
                    muscleCount[pgsga.muscleBewteenBones].num++;
                }
                if (muscleCount[pgsga.muscleOfScapula]) {
                    muscleCount[pgsga.muscleOfScapula].num++;
                }
                if (muscleCount[pgsga.muscleOfThigh]) {
                    muscleCount[pgsga.muscleOfThigh].num++;
                }
                if (muscleCount[pgsga.muscleOfLowerLeg]) {
                    muscleCount[pgsga.muscleOfLowerLeg].num++;
                }
                //分数个数最多的分数计入总分
                muscleCount.sort((arg1, arg2) => {
                    return arg1.num - arg2.num;
                });
                var score = muscleCount[3].num && muscleCount[3].score || 0;
                if (muscleCount[3].num) {
                    self.setData({
                        'pgsga.muscleOfTotalGrade': score
                    });
                }
                return score;
            }

            function _countStep9() {
                var edemaCount = [{
                    score: 0,
                    num: 0
                }, {
                    score: 1,
                    num: 0
                }, {
                    score: 2,
                    num: 0
                }, {
                    score: 3,
                    num: 0
                }];
                if (edemaCount[pgsga.edemaOfAnkle]) {
                    edemaCount[pgsga.edemaOfAnkle].num++;
                }
                if (edemaCount[pgsga.edemaOfShin]) {
                    edemaCount[pgsga.edemaOfShin].num++;
                }
                if (edemaCount[pgsga.edemaOfAbdominal]) {
                    edemaCount[pgsga.edemaOfAbdominal].num++;
                }
                //分数个数最多的分数计入总分
                edemaCount.sort((arg1, arg2) => {
                    return arg1.num - arg2.num;
                });
                var score = edemaCount[3].num && edemaCount[3].score || 0;
                if (edemaCount[3].num) {
                    self.setData({
                        'pgsga.edemaOfTotalGrade': score
                    });
                }
                return score;
            }
        },
        setResult(score) {
            if (score >= 0 && score <= 1) {
                this.setData({
                    'pgsga._result': 'A'
                });
            }
            if (score >= 2 && score <= 3) {
                this.setData({
                    'pgsga._result': 'B'
                });
            }
            if (score >= 4) {
                this.setData({
                    'pgsga._result': 'C'
                });
            }
            if (score >= 9) {
                this.setData({
                    'pgsga._result': 'D'
                });
            }
        },
        //兼容旧营养系统
        setInfo(pgsga) {
            if (!pgsga) {
                return;
            }
            this.nowId = pgsga.id;
            var data = {
                id: pgsga.id,
                aGrade: pgsga.aGrade,
                bGrade: pgsga.bGrade,
                cGrade: pgsga.cGrade,
                dGrade: pgsga.dGrade,
                filtratedDate: pgsga.filtratedDate,
                currentWeight: pgsga.currentWeight,
                currentStature: pgsga.currentStature,
                weightOneMouthAgo: pgsga.weightOneMouthAgo,
                weightSixMouthAgo: pgsga.weightSixMouthAgo,
                weightChange: pgsga.weightChange,
                dieteticChange: pgsga.dieteticChange && pgsga.dieteticChange.split(',') || [],
                appetiteChange: pgsga.appetiteChange,
                symptom: [],
                wherePained: pgsga.wherePained,
                other: pgsga.other,
                physicalCondition: pgsga.physicalCondition,
                mainDiagnosis: pgsga.mainDiagnosis,
                mainDeseasePeriod: '',
                otherMainDeseasePeriod: '',
                fatOfCheek: isNaN(parseInt(pgsga.fatOfCheek)) ? '' : parseInt(pgsga.fatOfCheek),
                fatOfTriceps: isNaN(parseInt(pgsga.fatOfTriceps)) ? '' : parseInt(pgsga.fatOfTriceps),
                fatOfRib: isNaN(parseInt(pgsga.fatOfRib)) ? '' : parseInt(pgsga.fatOfRib),
                fatOfLack: isNaN(parseInt(pgsga.fatOfLack)) ? '' : parseInt(pgsga.fatOfLack),
                muscleOfTempora: isNaN(parseInt(pgsga.muscleOfTempora)) ? '' : parseInt(pgsga.muscleOfTempora),
                muscleOfCollarbone: isNaN(parseInt(pgsga.muscleOfCollarbone)) ? '' : parseInt(pgsga.muscleOfCollarbone),
                muscleOfShoulder: isNaN(parseInt(pgsga.muscleOfShoulder)) ? '' : parseInt(pgsga.muscleOfShoulder),
                muscleBewteenBones: isNaN(parseInt(pgsga.muscleBewteenBones)) ? '' : parseInt(pgsga.muscleBewteenBones),
                muscleOfScapula: isNaN(parseInt(pgsga.muscleOfScapula)) ? '' : parseInt(pgsga.muscleOfScapula),
                muscleOfThigh: isNaN(parseInt(pgsga.muscleOfThigh)) ? '' : parseInt(pgsga.muscleOfThigh),
                muscleOfLowerLeg: isNaN(parseInt(pgsga.muscleOfLowerLeg)) ? '' : parseInt(pgsga.muscleOfLowerLeg),
                muscleOfTotalGrade: isNaN(parseInt(pgsga.muscleOfTotalGrade)) ? '' : parseInt(pgsga.muscleOfTotalGrade),
                edemaOfAnkle: isNaN(parseInt(pgsga.edemaOfAnkle)) ? '' : parseInt(pgsga.edemaOfAnkle),
                edemaOfShin: isNaN(parseInt(pgsga.edemaOfShin)) ? '' : parseInt(pgsga.edemaOfShin),
                edemaOfAbdominal: isNaN(parseInt(pgsga.edemaOfAbdominal)) ? '' : parseInt(pgsga.edemaOfAbdominal),
                edemaOfTotalGrade: isNaN(parseInt(pgsga.edemaOfTotalGrade)) ? '' : parseInt(pgsga.edemaOfTotalGrade),
                result: pgsga.score
            };
            if (pgsga.metabolismStatus) {
                var arr = data.metabolismStatus.split(',');
                data.metabolismStatus1 = isNaN(parseInt(arr[0])) ? null : parseInt(arr[0]);
                data.metabolismStatus2 = isNaN(parseInt(arr[1])) ? null : parseInt(arr[1]);
                data.metabolismStatus3 = isNaN(parseInt(arr[2])) ? null : parseInt(arr[2]);
            }
            switch (parseInt(pgsga.mainDeseasePeriod)) {
                case 1:
                    data.mainDeseasePeriod = '1级';
                    data.otherMainDeseasePeriod = 1;
                    break;
                case 2:
                    data.mainDeseasePeriod = '2级';
                    data.otherMainDeseasePeriod = 2;
                    break;
                case 3:
                    data.mainDeseasePeriod = '3级';
                    data.otherMainDeseasePeriod = 3;
                    break;
                case 4:
                    data.mainDeseasePeriod = '4级';
                    data.otherMainDeseasePeriod = 4;
                    break;
                default:
                    data.otherMainDeseasePeriod = isNaN(parseInt(data.mainDeseasePeriod)) ? '' : parseInt(data.mainDeseasePeriod);
                    data.mainDeseasePeriod = '其他';
                    break;
            }
            if (pgsga.sick) {
                data.symptom.push('恶心');
            }
            if (pgsga.emesis) {
                data.symptom.push('呕吐');
            }
            if (pgsga.constipation) {
                data.symptom.push('便秘');
            }
            if (pgsga.diarrhea) {
                data.symptom.push('腹泻');
            }
            if (pgsga.pain) {
                data.symptom.push('痛');
            }
            if (pgsga.dry) {
                data.symptom.push('口干');
            }
            if (pgsga.swallowHard) {
                data.symptom.push('吞咽困难');
            }
            if (pgsga.feelGlutted) {
                data.symptom.push('容易饱胀');
            }
            if (pgsga.noDieteticProblem) {
                data.symptom.push('没有饮食方面的问题');
            }
            if (pgsga.noAppetite) {
                data.symptom.push('没有食欲');
            }
            if (pgsga.smellly) {
                data.symptom.push('有怪味困扰着我');
            }
            if (pgsga.noTaste) {
                data.symptom.push('吃起来感觉没有味道');
            }
            if (pgsga.pain) {
                data.symptom.push('口腔溃疡');
            }
            if (pgsga.wherePainedCheck) {
                data.symptom.push('何处疼痛');
            }
            if (pgsga.otherCheck) {
                data.symptom.push('其他');
            }
            this.setData({
                pgsga: data,
                filtratedDate: pgsga.originDate,
                doctorName: pgsga.doctorName
            })
            this.setResult(pgsga.score || 0);
        },
        getSaveData() {
            var data = {
                ...this.data.pgsga,
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
            data.score = data.result;
            data.dieteticChange = data.dieteticChange.join(',');
            data.mainDeseasePeriod = this.data.mainDeseasePeriodMap[this.data.pgsga.mainDeseasePeriod] || this.data.pgsga.otherMainDeseasePeriod;
            data.metabolismStatus = [data.metabolismStatus1, data.metabolismStatus2, data.metabolismStatus3].join(',');
            data.sick = false;
            if (data.symptom.indexOf('恶心') > -1) {
                data.sick = true;
            }
            data.emesis = false;
            if (data.symptom.indexOf('呕吐') > -1) {
                data.emesis = true;
            }
            data.constipation = false;
            if (data.symptom.indexOf('便秘') > -1) {
                data.constipation = true;
            }
            data.diarrhea = false;
            if (data.symptom.indexOf('腹泻') > -1) {
                data.diarrhea = true;
            }
            data.pain = false;
            if (data.symptom.indexOf('痛') > -1) {
                data.pain = true;
            }
            data.dry = false;
            if (data.symptom.indexOf('口干') > -1) {
                data.dry = true;
            }
            data.swallowHard = false;
            if (data.symptom.indexOf('吞咽困难') > -1) {
                data.swallowHard = true;
            }
            data.feelGlutted = false;
            if (data.symptom.indexOf('容易饱胀') > -1) {
                data.feelGlutted = true;
            }
            data.noDieteticProblem = false;
            if (data.symptom.indexOf('没有饮食方面的问题') > -1) {
                data.noDieteticProblem = true;
            }
            data.noAppetite = false;
            if (data.symptom.indexOf('没有食欲') > -1) {
                data.noAppetite = true;
            }
            data.smellly = false;
            if (data.symptom.indexOf('有怪味困扰着我') > -1) {
                data.smellly = true;
            }
            data.noTaste = false;
            if (data.symptom.indexOf('吃起来感觉没有味道') > -1) {
                data.noTaste = true;
            }
            data.pain = false;
            if (data.symptom.indexOf('口腔溃疡') > -1) {
                data.pain = true;
            }
            data.wherePainedCheck = false;
            if (data.symptom.indexOf('何处疼痛') > -1) {
                data.wherePainedCheck = true;
            }
            data.otherCheck = false;
            if (data.symptom.indexOf('其他') > -1) {
                data.otherCheck = true;
            }
            return data;
        },
        loadList(refresh) {
            refresh && wx.jyApp.showLoading('加载中', true);
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'pgsga',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient,
                    pageNum: 1,
                    pageSize: 1000
                }
            }).then((data) => {
                data.result.rows.map((item) => {
                    item.originDate = item.filtratedDate;
                    item.filtratedDate = item.filtratedDate && new Date(item.filtratedDate).formatTime('yyyy-MM-dd') || ''
                });
                this.setData({
                    dataList: data.result.rows || []
                });
                if (!this.nowId) {
                    this.setInfo(data.result.rows[0]);
                }
            }).finally(() => {
                refresh && wx.hideLoading();
            });
        },
        onSave() {
            if (this.data.pgsga.result > 2) {
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
                        method: 'pgsga',
                        params: JSON.stringify({
                            ...data
                        })
                    }
                }).then((_data) => {
                    this.setData({
                        step: 1
                    });
                    wx.hideLoading();
                    wx.jyApp.toast('保存成功');
                    if (!data.id) {
                        this.setData({
                            'pgsga.id': _data.result.data
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