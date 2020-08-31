Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.id = option.id;
        this.loadInfo();
    },
    loadInfo() {
        wx.jyApp.http({
            url: '/nutritionorder/info/' + this.id
        }).then((data) => {
            data.detail._sex = data.detail.sex == 1 ? '男' : '女';
            data.detail.age = new Date().getFullYear() - Date.prototype.parseDate(data.detail.birthday).getFullYear();
            data.detail._status = wx.jyApp.constData.orderStatusMap[data.detail.status];
            data.detail.orderTime = new Date(data.detail.orderTime).formatTime('yyyy-MM-dd');
            data.detail.goods.map((item) => {
                item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                if (item.type == 1) {
                    item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                } else {
                    item.usage = `${item.days}天，${item._frequency}，每次1份，配制${item.modulateDose}毫升，${item._giveWay}`;
                }
            });
            this.setData({
                order: data.detail
            });
            if ([1, 7, 8].indexOf(this.data.order.status) > -1) {
                this.setData({
                    statusColor: 'success-color'
                });
            }
        });
    }
})