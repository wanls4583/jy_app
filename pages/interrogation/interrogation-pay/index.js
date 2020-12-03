/*
 * @Author: lisong
 * @Date: 2020-11-02 15:12:40
 * @Description: 
 */
Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.setData({
            goodsName: wx.jyApp.tempData.illness.doctorName + '-' + '图文问诊',
            consultOrderPrice: wx.jyApp.tempData.illness.consultOrderPrice,
            orderTime: new Date().formatTime('yyyy-MM-dd')
        });
    },
    onSubmit() {
        wx.jyApp.utils.requestSubscribeMessage(wx.jyApp.constData.subIds.doctorReciveMsg).finally(() => {
            wx.jyApp.showLoading('支付中...', true);
            wx.jyApp.http({
                url: wx.jyApp.tempData.illness == 3 ? '/consultorder/video/save' : '/consultorder/save',
                method: 'post',
                data: {
                    'bookDateTime': wx.jyApp.tempData.illness.bookDateTime || '',
                    "diseaseDetail": wx.jyApp.tempData.illness.diseaseDetail,
                    "doctorId": wx.jyApp.tempData.illness.doctorId,
                    "patientId": wx.jyApp.tempData.illness.patientId,
                    "picUrls": wx.jyApp.tempData.illness.picUrls.join(',')
                }
            }).then((data) => {
                delete wx.jyApp.tempData.illness;
                var delta = 3;
                if (data.params) {
                    wx.jyApp.utils.pay(data.params, () => {
                        wx.navigateBack({
                            delta: delta
                        });
                    }).then(() => {
                        wx.jyApp.tempData.payInterrogationResult = {
                            id: data.id,
                            type: wx.jyApp.tempData.illness.type,
                            result: 'success'
                        }
                    }).catch((err) => {
                        wx.jyApp.tempData.payInterrogationResult = {
                            id: data.id,
                            result: 'fail'
                        }
                        wx.navigateBack({
                            delta: delta
                        });
                    });
                } else {
                    wx.jyApp.tempData.payInterrogationResult = {
                        id: data.id,
                        type: wx.jyApp.tempData.illness.type,
                        result: 'success'
                    }
                    wx.navigateBack({
                        delta: delta
                    });
                }
            }).finally(() => {
                wx.hideLoading();
            });
        });
    }
})