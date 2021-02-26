/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        active: 0,
        nrs: true,
        pgsga: false,
        medicalRecord: false,
        firstConsult: false,
        wardRound: false,
        biochemical: false,
        role: '护士'
    },
    onLoad(option) {
        var role = '';
        var userInfo = wx.getStorageSync('mobileUserInfo');
        if(userInfo.roleName.indexOf('ROLE_NUTRITIONIST') > -1) {
            role = '医生';
        } else if(userInfo.roleName.indexOf('ROLE_NURSE') > -1) {
            role = '护士'
        }
        this.inHospitalNumber = option.inHospitalNumber;
        this.isInpatient = option.isInpatient;
        this.patient = wx.jyApp.getTempData('nutritionPatient');
        this.patient._sex = this.patient.sex == 1 ? '男' : '女';
        this.setData({
            patient: this.patient,
            role: role
        });
        this.loadPatientDocument();
    },
    onUnload() {},
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current,
            [e.detail.currentItemId]: true
        });
        var title = '';
        switch (e.detail.currentItemId) {
            case 'nrs':
                title = 'NRS';
                break;
            case 'pgsga':
                title = 'PGSGA';
                break;
            case 'medicalRecord':
                title = '营养病历';
                break;
            case 'firstConsult':
                title = '初次会诊';
                break;
            case 'wardRound':
                title = '营养查房';
                break;
            case 'biochemical':
                title = '生化检查';
                break;
        }
        wx.setNavigationBarTitle({
            title: title
        });
    },
    loadPatientDocument() {
        wx.jyApp.http({
            type: 'mobile',
            url: '/app/nutrition/query',
            data: {
                method: 'nutritionDocument',
                inHospitalNumber: this.inHospitalNumber,
                isInpatient: this.isInpatient
            }
        }).then((data) => {
            data = data.result;
            wx.jyApp.setTempData('medicalRecord', data);
        });
    }
})