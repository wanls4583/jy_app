Page({
    data: {
        showTextPrice: false,
        showGuidePrice: false,
        consultOrderPrice: 0,
        nutritionOrderPrice: 0,
        editConsultOrderPrice: 0,
        editNutritionOrderPrice: 0,
        consultOrderSwitch: false,
        status: '',
        statusVisible: false,
        statusList: [],
        statusMap: {},
        statusDefault: 0,
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        wx.nextTick(() => {
            this.getDoctorInfo();
        });
        this.setData({
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
    onSwitchChange(e) {
        this.setData({
            consultOrderSwitch: !this.data.consultOrderSwitch
        });
        this.submit();
    },
    onClickTextPrice() {
        this.setData({
            showTextPrice: true
        });
    },
    onClickGuidePrice() {
        this.setData({
            showGuidePrice: true
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
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    confirmTextPrice(e) {
        this.setData({
            consultOrderPrice: this.data.editConsultOrderPrice,
            showTextPrice: false
        });
        this.submit();
    },
    confirmGuidPrice(e) {
        this.setData({
            nutritionOrderPrice: this.data.editNutritionOrderPrice,
            showGuidePrice: false
        });
        this.submit();
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
    getDoctorInfo() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/info/' + this.data.userInfo.id
        }).then((data) => {
            wx.hideLoading();
            this.setData({
                consultOrderPrice: data.doctor.consultOrderPrice,
                nutritionOrderPrice: data.doctor.nutritionOrderPrice,
                editConsultOrderPrice: data.doctor.consultOrderPrice,
                editNutritionOrderPrice: data.doctor.nutritionOrderPrice,
                consultOrderSwitch: data.doctor.consultOrderSwitch,
                status: data.doctor.status
            });
            this.data.statusList.map((item, index) => {
                if (item.value == data.doctor.status) {
                    this.setData({
                        statusList: this.data.statusList,
                        statusDefault: index
                    });
                }
            });
        });
    },
    submit() {
        return wx.jyApp.http({
            url: '/doctor/config',
            method: 'post',
            data: {
                consultOrderPrice: this.data.consultOrderPrice,
                nutritionOrderPrice: this.data.nutritionOrderPrice,
                consultOrderSwitch: this.data.consultOrderSwitch,
                status: this.data.status
            }
        }).then(() => {

        });
    }
})