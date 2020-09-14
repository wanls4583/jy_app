Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['defaultAddress', 'selectAddress', 'userInfo'],
            actions: ['updateDefaultAddress', 'updateSelectAddress'],
        });
        this.storeBindings.updateStoreBindings();
        if (!this.data.selectAddress) {
            this.loadAddressList();
        }
        this.id = option.id;
        this.loadInfo();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //选择支付地址
    onSelectAddress() {
        wx.jyApp.selectAddressFlag = true;
        wx.navigateTo({
            url: '/pages/mall/address-list/index'
        });
    },
    //支付营养指导单
    onGuidanceOrderPay() {
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/wx/pay/nutrition/submit',
            method: 'post',
            data: {
                addressId: this.data.selectAddress.id,
                orderId: this.id
            }
        }).then((data) => {
            wx.hideLoading();
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.showToast({
                    title: '支付成功'
                });
                this.loadInfo();
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        }).catch(() => {
            wx.hideLoading();
        });
    },
    loadInfo() {
        !this.loaded && wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/nutritionorder/info/' + this.id
        }).then((data) => {
            data.detail._sex = data.detail.sex == 1 ? '男' : '女';
            data.detail.age = new Date().getFullYear() - Date.prototype.parseDate(data.detail.birthday).getFullYear();
            data.detail._status = wx.jyApp.constData.mallOrderStatusMap[data.detail.status];
            data.detail.goods.map((item) => {
                item._frequency = wx.jyApp.constData.frequencyArray[item.frequency - 1];
                item._giveWay = wx.jyApp.constData.giveWayMap[item.giveWay];
                item._unit = wx.jyApp.constData.giveWayMap[item.giveWay];
                item.goodsPic = item.goodsPic && item.goodsPic.split(',')[0] || '';
                if (item.type == 1) {
                    item._unit = wx.jyApp.constData.unitChange[item.unit];
                    item.usage = `${item.days}天，${item._frequency}，每次${item.perUseNum}${wx.jyApp.constData.unitChange[item.standardUnit]}，${item._giveWay}`;
                } else {
                    item.usage = `${item.days}天，${item._frequency}，每次1份，配制${item.modulateDose}毫升，${item._giveWay}`;
                    item._unit = '份';
                }
            });
            switch (data.detail.status) {
                case 0:
                case 5:
                case 6:
                    data.detail.statusColor = 'danger-color';
                    break;
                case 1:
                case 7:
                case 8:
                    data.detail.statusColor = 'success-color';
                    break;
            }
            this.setData({
                order: data.detail
            });
        }).finally(() => {
            wx.hideLoading();
            this.loaded = true;
        });
    },
    loadAddressList() {
        if(this.data.selectAddress) {
            return;
        }
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            data.list = data.list || [];
            data.list.map((item) => {
                if (item.isDefault) {
                    this.updateSelectAddress(item);
                    this.updateDefaultAddress(item);
                }
            });
            if (!wx.jyApp.store.defaultAddress && data.list.length) {
                this.updateSelectAddress(data.list[0]);
                this.updateDefaultAddress(data.list[0]);
            }
        });
    }
})