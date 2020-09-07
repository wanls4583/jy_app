Page({
    data: {
        content: '',
        score: 5,
        doctor: {}
    },
    onLoad(option) {
        this.id = option.id;
        this.doctorId = option.doctorId;
        this.storeBindings.updateBindings();
        this.getDoctorInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        clearTimeout(this.toastTimer);
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onChange(e) {
        this.setData({
            score: e.datail
        });
    },
    onSubmit() {
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/usersuggestion/save',
            method: 'post',
            data: {
                content: this.data.content,
                phone: this.data.phone,
                side: this.data.userInfo.role == 'DOCTOR' ? 'DOCTOR' : 'USER'
            }
        }).then(() => {
            wx.showToast({ title: '反馈成功' });
            this.toastTimer = setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }).finally(() => {
            wx.hideLoading();
        });
    },
    getDoctorInfo() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: `/doctor/info/${this.id}`
        }).then((data) => {
            if (data.doctor) {
                this.setData({
                    doctor: data.doctor
                });
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
})