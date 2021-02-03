/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        hospitalVisible: false,
        hospitalName: '',
        hospital: '',
        hospitalList: [{
            hospitalName: '医院1',
            id: 1
        }]
    },
    onLoad(option) {

    },
    onUnload() {},
    onShowHospital() {
        this.setData({
            hospitalVisible: true
        });
    },
    onConfirmHospital(e) {
        this.setData({
            hospitalName: e.detail.value.hospitalName,
            hospital: e.detail.value.id,
            hospitalVisible: false
        });
    },
    onCancel() {
        this.setData({
            hospitalVisible: false
        });
    }
})