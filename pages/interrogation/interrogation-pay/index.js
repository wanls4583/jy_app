Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.setData({
            goodsName: wx.jyApp.illness.doctorName + '-' + '图文问诊',
            consultOrderPrice: wx.jyApp.illness.consultOrderPrice,
            orderTime: new Date().formatTime('yyyy-MM-dd')
        });
    },
    onSubmit() {
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/consultorder/save',
            method: 'post',
            data: {
                "diseaseDetail": wx.jyApp.illness.diseaseDetail,
                "doctorId": wx.jyApp.illness.doctorId,
                "patientId": wx.jyApp.illness.patientId,
                "picUrls": wx.jyApp.illness.picUrls.join(',')
            }
        }).then((data) => {
            delete wx.jyApp.illness;
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.jyApp.payInterrogationResult = {
                    id: data.id,
                    result: 'success'
                }
                wx.navigateBack({
                    delta: 3
                });
            }).catch(() => {
                wx.jyApp.payInterrogationResult = {
                    id: data.id,
                    result: 'fail'
                }
                wx.navigateBack({
                    delta: 3
                });
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})