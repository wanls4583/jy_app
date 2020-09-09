Page({
    data: {
        content: '',
        score: 5,
        anonymous: 0,
        doctor: {},
        result: '非常满意'
    },
    onLoad(option) {
        this.id = option.id;
        this.doctorId = option.doctorId;
        this.getDoctorInfo();
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onChange(e) {
        this.setData({
            score: e.detail
        });
        if (this.data.score <= 2) {
            this.setData({
                result: '差'
            });
        } else if (this.data.score <= 4) {
            this.setData({
                result: '满意'
            });
        } else {
            this.setData({
                result: '非常满意'
            });
        }
    },
    //匿名选项
    onCheck() {
        this.setData({
            anonymous: this.data.anonymous == 1 ? 0 : 1
        });
    },
    onSubmit() {
        if (this.data.content.length < 5) {
            wx.jyApp.toast('评价内容不能少于5个字');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctorappraise/save',
            method: 'post',
            data: {
                anonymous: this.data.anonymous,
                content: this.data.content,
                consultOrderId: this.id,
                score: this.data.score
            }
        }).then(() => {
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({ title: '提交成功' });
            }, 500);
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
            url: `/doctor/info/${this.doctorId}`
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