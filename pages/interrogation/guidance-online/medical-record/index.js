/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        isFirst: 1,
        foodSensitive: '',
        hasFoodSensitive: 0,
        mainSuit: '',
        currentDisease: '',
        historyDisease: '',
        symptom: '',
        handlePlan: '',
        orgList: [],
        orgVisible: false,
        firstMedicalOrg: '钜元门诊部',
    },
    onLoad(option) {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        var patient = wx.jyApp.getTempData('guidePatient');
        this.from = option.from;
        this.consultOrderId = option.id;
        this.id = '';
        this.setData({
            from: this.from
        });
        if (this.data.from == 'examine') {
            wx.setNavigationBarTitle({
                title: '处方审核'
            });
        }
        if (guideOrderDetail) { //修改
            patient = {
                patientName: guideOrderDetail.patientName,
                age: guideOrderDetail.age,
                sex: guideOrderDetail.sex,
                height: guideOrderDetail.height,
                weight: guideOrderDetail.weight,
            }
            patient._sex = patient.sex == 1 ? '男' : '女';
            patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
            patient.BMI = patient.BMI && patient.BMI.toFixed(1) || '';
            this.setData({
                isFirst: guideOrderDetail.isFirst,
                foodSensitive: guideOrderDetail.foodSensitive,
                hasFoodSensitive: guideOrderDetail.foodSensitive ? 1 : 0,
                mainSuit: guideOrderDetail.mainSuit,
                currentDisease: guideOrderDetail.currentDisease,
                historyDisease: guideOrderDetail.historyDisease,
                firstMedicalOrg: guideOrderDetail.firstMedicalOrg || '',
                handlePlan: guideOrderDetail.handlePlan,
                patient: patient
            });
            this.id = guideOrderDetail.id;
            this.consultOrderId = guideOrderDetail.consultOrderId;
            wx.jyApp.setTempData('guidePatient', patient);
        } else {
            patient._sex = patient.sex == 1 ? '男' : '女';
            patient.BMI = (patient.weight) / (patient.height * patient.height / 10000);
            patient.BMI = patient.BMI && patient.BMI.toFixed(1) || '';
            this.setData({
                patient: patient,
                mainSuit: patient.diseaseDetail || ''
            });
            if (patient.foodSensitive) {
                this.setData({
                    hasFoodSensitive: 1,
                    foodSensitive: patient.foodSensitive
                });
            }
        }
        //加载医疗结构
        this.loadOrgList();
    },
    onUnload() {
        wx.jyApp.clearTempData('guidanceData');
        wx.jyApp.clearTempData('guidePatient');
        wx.jyApp.clearTempData('guideOrderDetail');
    },
    onInput(e) {
        if(typeof e.detail == 'string') {
            e.detail = e.detail.replace(wx.jyApp.constData.emojiReg, '');
        } else {
            e.detail.value = e.detail.value.replace(wx.jyApp.constData.emojiReg, '');
        }
        wx.jyApp.utils.onInput(e, this);
    },
    onChange(e) {
        //审核时禁止修改
        if (this.from == 'examine') {
            return;
        }
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
        if (this.data.isFirst == 1) {
            this.setData({
                firstMedicalOrg: '钜元门诊部'
            });
        } else if(prop == 'isFirst') {
            this.setData({
                firstMedicalOrg: ''
            });
        }
    },
    onClickOrg() {
        this.setData({
            orgVisible: !this.data.orgVisible,
            orgText: this.data.firstMedicalOrg,
            orgList: this.allOrg.filter((item) => {
                return item && item.indexOf(this.data.firstMedicalOrg) > -1;
            })
        });
    },
    onSearch(e) {
        var text = e.detail.value;
        this.setData({
            orgText: text,
            orgList: this.allOrg.filter((item) => {
                return item && item.indexOf(text) > -1
            })
        });
    },
    onSelect(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            orgText: item,
            firstMedicalOrg: item,
            orgVisible: false
        });
    },
    onConfirm(e) {
        this.setData({
            firstMedicalOrg: this.data.orgText,
            orgVisible: false
        });
    },
    onSave() {
        if (this.data.hasFoodSensitive == 1 && !this.data.foodSensitive) {
            wx.jyApp.toast('请输入过敏史');
            return;
        }
        if (!wx.jyApp.getTempData('guidanceData')) {
            wx.jyApp.setTempData('guidanceData', {
                id: this.id,
                from: this.from,
                consultOrderId: this.consultOrderId,
                isFirst: this.data.isFirst,
                foodSensitive: this.data.hasFoodSensitive == 1  && this.data.foodSensitive || '',
                mainSuit: this.data.mainSuit,
                currentDisease: this.data.currentDisease,
                historyDisease: this.data.historyDisease,
                symptom: this.data.symptom,
                handlePlan: this.data.handlePlan,
                firstMedicalOrg: this.data.firstMedicalOrg
            });
        }
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/guidance-online/guidance-diagnosis/index'
        });
    },
    loadOrgList() {
        wx.jyApp.http({
            url: '/medical/org/list'
        }).then((data) => {
            this.allOrg = data.list;
        });
    }
})