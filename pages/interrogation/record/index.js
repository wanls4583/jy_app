/*
 * @Author: lisong
 * @Date: 2020-09-08 20:40:56
 * @Description: 
 */
Page({
    data: {
        activeNames: ['info', 'screen', 'type1', 'type3', 'guide']
    },
    onLoad(option) {
        this.patientId = option.patientId;
        this.getInfo();
    },
    onUnload() {},
    onCollapseChange(e) {
        this.setData({
            activeNames: e.detail,
        });
    },
    //点击图片放大
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        var picUrls = e.currentTarget.dataset.picUrls;
        wx.previewImage({
            current: src,
            urls: picUrls
        });
    },
    getInfo() {
        wx.jyApp.http({
            url: `/patientdocument/detail/${this.patientId}`
        }).then((data) => {
            data.patientDocument._sex = data.patientDocument.sex == 1 ? '男' : '女';
            data.patientDocument.BMI = (data.patientDocument.weight) / (data.patientDocument.height * data.patientDocument.height / 10000);
            data.patientDocument.BMI = data.patientDocument.BMI && data.patientDocument.BMI.toFixed(2) || '';
            for (var key in data.consultOrder) {
                data.consultOrder[key].map((item) => {
                    item.picUrls = item.picUrls && item.picUrls.split(',') || [];
                    item.orderTime = new Date(item.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
                });
            }
            data.nutritionOrder = data.nutritionOrder || [];
            data.nutritionOrder.map((_item) => {
                _item.orderTime = new Date(_item.orderTime).formatTime('yyyy-MM-dd hh:mm:ss');
                _item.goods.map((item) => {
                    item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                    item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                    if (item.type == 1) {
                        item._unit = wx.jyApp.constData.unitChange[item.unit];
                        item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                    } else {
                        item.usage = `${item.days}天，${item._frequency}，每次1份，${Number(this.data.modulateDose) ? '配制' + this.data.modulateDose + '毫升，' : ''}${item._giveWay}`;
                        item._unit = '份';
                    }
                });
            });
            data.filtrate = data.filtrate || [];
            data.filtrate.map((item) => {
                item._filtrateType = item.filtrateType;
                if (item.filtrateType == 'FAT') {
                    item._filtrateType = '超重与肥胖'
                    if(item.filtrateResult == 1) {
                        item._filtrateResult = '体重正常';
                    }
                    if (item.filtrateResult == 2) {
                        item._filtrateResult = '超重';
                    }
                    if (item.filtrateResult == 3) {
                        item._filtrateResult = '肥胖';
                    }
                    if (item.filtrateResult == 4) {
                        item._filtrateResult = '中心性肥胖（BMI超重）';
                    }
                    if (item.filtrateResult == 5) {
                        item._filtrateResult = '中心性肥胖（BMI肥胖）';
                    }
                }
            });
            this.setData({
                patientDocument: data.patientDocument,
                nutritionOrder: data.nutritionOrder,
                consultOrder: data.consultOrder,
                filtrate: data.filtrate
            });
        });
    }
})