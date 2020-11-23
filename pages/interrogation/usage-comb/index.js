Page({
    data: {
        unitChange: wx.jyApp.constData.unitChange,
        giveWayVisible: false,
        giveWayList: [],
        _frequency: '',
        _giveWay: '',
        giveWay: '',
        totalAmount: 0,
        count: '',
        days: '',
        modulateDose: 0,
        giveWayDefault: 0,
        productList: [],
    },
    onLoad() {
        var giveWayMap = wx.jyApp.constData.giveWayMap;
        var giveWayList = [];
        var goods = wx.jyApp.tempData.usageGoods;
        goods.hideBtn = true;
        for (var key in giveWayMap) {
            giveWayList.push({
                label: giveWayMap[key],
                value: key
            });
        }
        this.setData({
            goods: goods,
            days: goods.days,
            count: goods.count || 1,
            modulateDose: goods.modulateDose || 0,
            giveWay: goods.giveWay,
            remark: goods.remark,
            _giveWay: giveWayMap[goods.giveWay],
            _frequency: wx.jyApp.constData.frequencyArray[goods.frequency - 1],
            totalAmount: goods.totalAmount || goods.price
        });
        giveWayList.map((item, index) => {
            if (this.data.giveWay == item.value) {
                this.setData({
                    giveWayDefault: index
                });
            }
        });
        this.setData({
            giveWayList: giveWayList
        });
        this.loadProduct();
    },
    onUnload() {
        if (!this.saved) {
            wx.jyApp.tempData.usageGoods = undefined;
        }
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //手动改变总量(总量为整数)
    onCountChang(e) {
        var count = e.detail;
        this.setData({
            count: count,
            totalAmount: (count * this.data.goods.price).toFixed(2)
        });
    },
    onShowGiveWay() {
        this.setData({
            giveWayVisible: true
        });
    },
    onConfirmGiveWay(e) {
        this.setData({
            _giveWay: e.detail.value.label,
            giveWay: e.detail.value.value,
            giveWayVisible: false
        });
    },
    onCancel() {
        this.setData({
            giveWayVisible: false
        });
    },
    onSave() {
        this.saved = true;
        this.data.goods.perUseNum = 1;
        this.data.goods.giveWay = this.data.giveWay;
        this.data.goods.days = this.data.days;
        this.data.goods.count = this.data.count;
        this.data.goods.remark = this.data.remark;
        this.data.goods.totalAmount = this.data.totalAmount;
        this.data.goods.usage = `${(this.data.days * this.data.count).toFixed(2)}天，${this.data._frequency}，${Number(this.data.goods.modulateDose) ? '配制' + this.data.goods.modulateDose + '毫升，' : ''}${this.data._giveWay}`;
        var pages = getCurrentPages();
        wx.navigateBack({
            delta: pages[pages.length - 2].route == 'pages/interrogation/search/index' ? 3 : (pages[pages.length - 2].route == 'pages/interrogation/product-list/index' ? 2 : 1)
        });
    },
    onBack() {
        if (!this.saved) {
            wx.jyApp.dialog.confirm({
                message: '当前数据未保存，是否离开？'
            }).then(() => {
                wx.navigateBack();
            });
        }
    },
    loadProduct() {
        wx.jyApp.http({
            url: `/goods/info/${this.data.goods.id}`
        }).then((data) => {
            this.setData({
                productList: data.info.items,
            });
        });
    },
})