Page({
    data: {
        consultOrderPrice: 0,
        nutritionOrderPrice: 0,
        consultOrderSwitch: 0,
        status: '',
        statusVisible: false,
        statusList: [],
        statusMap: {},
        statusDefault: 0,
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
            actions: ['updateDoctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            consultOrderPrice: this.data.doctorInfo.consultOrderPrice,
            nutritionOrderPrice: this.data.doctorInfo.nutritionOrderPrice,
            consultOrderSwitch: this.data.doctorInfo.consultOrderSwitch,
            status: this.data.doctorInfo.status,
            statusList: [{
                label: '上线',
                value: 1
            }, {
                label: '下线',
                value: 2
            }],
            statusMap: {
                1: '上线',
                2: '下线',
                3: '禁用'
            }
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onSwitchChange(e) {
        this.setData({
            consultOrderSwitch: this.data.consultOrderSwitch == 1 ? 0 : 1
        });
        this.submit();
    },
    onClickTextPrice() {
        wx.jyApp.utils.setText({
            title: '图文问诊每次金额',
            defaultValue: this.data.consultOrderPrice,
            type: 'number',
            complete: (value) => {
                this.setData({
                    consultOrderPrice: value
                });
                this.submit();
            }
        });
    },
    onClickGuidePrice() {
        wx.jyApp.utils.setText({
            title: '营养指导诊金',
            defaultValue: this.data.nutritionOrderPrice,
            type: 'number',
            complete: (value) => {
                this.setData({
                    nutritionOrderPrice: value
                });
                this.submit();
            }
        });
    },
    onClickStatus() {
        if (this.data.status != 1 && this.data.status != 2) {
            return;
        }
        this.setData({
            statusVisible: true
        });
    },
    onConfirmStatus(e) {
        this.setData({
            statusVisible: false,
            status: e.detail.value.value
        });
        this.submit();
    },
    onCancel() {
        this.setData({
            statusVisible: false
        });
    },
    submit() {
        return wx.jyApp.http({
            url: '/doctor/config',
            method: 'post',
            data: {
                consultOrderPrice: Number(this.data.consultOrderPrice) || 0,
                nutritionOrderPrice: Number(this.data.nutritionOrderPrice) || 0,
                consultOrderSwitch: this.data.consultOrderSwitch,
                status: this.data.status
            }
        }).then(() => {
            this.data.doctorInfo.consultOrderPrice = Number(this.data.consultOrderPrice) || 0
            this.data.doctorInfo.nutritionOrderPrice = Number(this.data.nutritionOrderPrice) || 0
            this.data.doctorInfo.consultOrderSwitch = this.data.consultOrderSwitch
            this.data.doctorInfo.status = this.data.status
            this.updateDoctorInfo(Object.assign({}, this.data.doctorInfo))
        });
    }
})