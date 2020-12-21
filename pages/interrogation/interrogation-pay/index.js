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
        var goodsName = '';
        var bookDateTime = '';
        if (wx.jyApp.tempData.illness.type == 3) {
            goodsName = wx.jyApp.tempData.illness.doctorName + '-' + '视频问诊';
            bookDateTime = wx.jyApp.tempData.illness.bookDateTime;
            bookDateTime = bookDateTime.formatTime('yyyy-MM-dd') + '&nbsp;' + wx.jyApp.constData.dayArr[bookDateTime.getDay()] + '&nbsp;' + bookDateTime.formatTime('hh:mm')
        } else {
            goodsName = wx.jyApp.tempData.illness.doctorName + '-' + '图文问诊';
        }
        this.setData({
            goodsName: goodsName,
            consultOrderPrice: wx.jyApp.tempData.illness.consultOrderPrice,
            orderTime: new Date().formatTime('yyyy-MM-dd'),
            bookDateTime: bookDateTime
        });
    },
    onSubmit() {
        var bookDateTime = '';
        if (wx.jyApp.tempData.illness.bookDateTime) {
            bookDateTime = wx.jyApp.tempData.illness.bookDateTime.formatTime('yyyy-MM-dd hh:mm');
        }
        var subIds = [];
        if (wx.jyApp.tempData.illness.type == 3) {
            subIds.push(wx.jyApp.constData.subIds.phone);
            subIds.push(wx.jyApp.constData.subIds.appointment);
            subIds.push(wx.jyApp.constData.subIds.appointmentSuc);
        }
        wx.jyApp.utils.requestSubscribeMessage(subIds).finally(() => {
            wx.jyApp.showLoading('支付中...', true);
            wx.jyApp.http({
                url: wx.jyApp.tempData.illness.type == 3 ? '/consultorder/video/save' : '/consultorder/save',
                method: 'post',
                data: {
                    'bookDateTime': bookDateTime,
                    "diseaseDetail": wx.jyApp.tempData.illness.diseaseDetail,
                    "doctorId": wx.jyApp.tempData.illness.doctorId,
                    "patientId": wx.jyApp.tempData.illness.patientId,
                    "picUrls": wx.jyApp.tempData.illness.picUrls.join(',')
                }
            }).then((data) => {
                var delta = 3;
                var type = wx.jyApp.tempData.illness.type;
                if (data.params) {
                    wx.jyApp.utils.pay(data.params, () => {
                        wx.navigateBack({
                            delta: delta
                        });
                    }).then(() => {
                        wx.jyApp.tempData.payInterrogationResult = {
                            id: data.id,
                            type: type,
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
                        type: type,
                        result: 'success'
                    }
                    wx.navigateBack({
                        delta: delta
                    });
                }
                delete wx.jyApp.tempData.illness;
            }).finally(() => {
                wx.hideLoading();
            });
        });
    }
})