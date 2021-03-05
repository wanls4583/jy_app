/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        hospitalVisible: false,
        hospitalName: '',
        hospitalId: '',
        hospitalList: [],
        employeeId: '',
        password: ''
    },
    onLoad(option) {
        if (wx.getStorageSync('mobileToken')) {
            // wx.jyApp.http({
            //     type: 'mobile',
            //     url: '/app/nutrition/query',
            //     data: {
            //         method: 'patient',
            //         patientId: '',
            //         pageNum: 1,
            //         pageSize: 1,
            //         isInpatient: true
            //     }
            // }).then(() => {
                wx.redirectTo({
                    url: '/pages/clinical-nutrition/patient-list/index'
                });
            // });
        } else {
            this.getHospitalList();
        }
    },
    onUnload() {},
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onShowHospital() {
        this.setData({
            hospitalVisible: true
        });
    },
    onConfirmHospital(e) {
        this.setData({
            hospitalName: e.detail.value.hospitalName,
            hospitalId: e.detail.value.id,
            hospitalVisible: false
        });
    },
    onCancel() {
        this.setData({
            hospitalVisible: false
        });
    },
    getHospitalList() {
        wx.jyApp.http({
            type: 'mobile',
            url: '/app/hospital/list',
            data: {
                page: 1,
                limit: 1000,
                status: 1,
                mobileStatus: 1
            }
        }).then((data) => {
            this.setData({
                hospitalList: data.page.list || []
            })
        });
    },
    onSubmit() {
        if (!this.data.hospitalId) {
            wx.jyApp.toast('医院不能为空')
            return;
        }
        if (!this.data.employeeId) {
            wx.jyApp.toast('请输入用户名')
            return;
        }
        if (!this.data.password) {
            wx.jyApp.toast('请输入密码')
            return;
        }
        wx.jyApp.showLoading('登录中...', true);
        wx.login({
            success: (res) => {
                wx.jyApp.http({
                    type: 'mobile',
                    url: '/nutrition/user/login',
                    method: 'post',
                    data: {
                        password: this.data.password,
                        hospitalId: this.data.hospitalId,
                        employeeId: this.data.employeeId,
                        code: res.code
                    }
                }).then((data) => {
                    wx.setStorageSync('mobileToken', data.token);
                    wx.setStorageSync('mobileUserInfo', data.info);
                    wx.redirectTo({
                        url: '/pages/clinical-nutrition/patient-list/index'
                    });
                }).finally(() => {
                    wx.hideLoading();
                });
            },
            fail: (err) => {

            }
        });

    }
})