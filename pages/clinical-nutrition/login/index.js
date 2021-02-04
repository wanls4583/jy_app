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
        this.getHospitalList();
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
            domain: 'https://dev.juyuanyingyang.com/',
            url: 'order/api/app/hospital/list',
            data: {
                page: 1,
                limit: 1000
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
            wx.jyApp.toast('账号不能为空')
            return;
        }
        if (!this.data.password) {
            wx.jyApp.toast('密码不能为空')
            return;
        }
        wx.jyApp.showLoading('登录中...', true);
        wx.login({
            success: (res) => {
                wx.jyApp.http({
                    domain: 'https://dev.juyuanyingyang.com/',
                    url: 'order/api/nutrition/user/login',
                    method: 'post',
                    data: {
                        password: this.data.password,
                        hospitalId: this.data.hospitalId,
                        employeeId: this.data.employeeId,
                        code: res.code
                    }
                }).then((data) => {

                });
            },
            fail: (err) => {

            }
        });

    }
})