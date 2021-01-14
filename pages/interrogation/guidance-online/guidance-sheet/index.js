/*
 * @Author: lisong
 * @Date: 2021-01-05 09:18:30
 * @Description: 
 */
Page({
    data: {
        recipe: {},
        bitText: '返回'
    },
    onLoad(option) {
        this.id = option.id;
        this.loadInfo();
        var pages = getCurrentPages();
        if (pages[pages.length - 5] && pages[pages.length - 5].route == 'pages/interrogation/chat/index') {
            this.setData({
                bitText: '返回聊天',
                tip: '指导单开具完成'
            });
        } else {
            this.setData({
                bitText: '返回列表',
                tip: '指导单审核完成'
            });
        }
    },
    onUnload() {},
    loadInfo() {
        wx.jyApp.http({
            url: `/nutritionorder/recipe/${this.id}`
        }).then((data) => {
            var recipe = data.recipe || {};
            var detail = recipe.detail || {};
            detail._sex = detail.sex == 1 ? '男' : '女';
            detail.orderTime = detail.orderTime && detail.orderTime.slice(0, 10);
            detail.goods && detail.goods.map((item) => {
                item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                item._unit = wx.jyApp.constData.giveWayMap[item.giveWay];
                if (item.type == 1) {
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                    item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                } else {
                    item.usage = `${item.days}天，${item._frequency}，每次1份，${Number(item.modulateDose) ? '配制' + item.modulateDose + '毫升，' : ''}${item._giveWay}`;
                    item._unit = '份';
                }
            });
            this.setData({
                recipe: recipe
            });
        });
    },
    onBack() {
        wx.navigateBack({
            delta: 4
        });
        wx.jyApp.clearTempData('guidanceData');
        wx.jyApp.clearTempData('guidePatient');
        wx.jyApp.clearTempData('guideOrderDetail');
    }
})