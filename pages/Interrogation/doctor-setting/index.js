Page({
    data: {
        showTextPrice: false,
        showGuidePrice: false,
        consultOrderPrice: 0,
        nutritionOrderPrice: 0,
        editConsultOrderPrice: 0,
        editNutritionOrderPrice: 0,
        consultOrderSwitch: false
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['authUserInfo']
        });
        wx.nextTick(() => {
            this.getDoctorInfo();
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
    getDoctorInfo() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/info/' + this.data.authUserInfo.id
        }).then((data) => {
            wx.hideLoading();
            this.setData({
                consultOrderPrice: data.doctor.consultOrderPrice,
                nutritionOrderPrice: data.doctor.nutritionOrderPrice,
                editConsultOrderPrice: data.doctor.consultOrderPrice,
                editNutritionOrderPrice: data.doctor.nutritionOrderPrice,
                consultOrderSwitch: data.doctor.consultOrderSwitch
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
                consultOrderSwitch: this.data.consultOrderSwitch
            }
        }).then(() => {

        });
    }
})