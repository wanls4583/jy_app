Page({
    data: {
        addressList: [],
        ifSelect: false
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['selectAddress'],
            actions: ['updateSelectAddress'],
        });
        this.storeBindings.updateStoreBindings();
        this.setData({
            ifSelect: wx.jyApp.selectAddressFlag || false
        });
        wx.jyApp.selectAddressFlag = false;
        this.loadList();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {
        if (wx.jyApp.reloadAddressList) {
            this.loadList();
            delete wx.jyApp.reloadAddressList;
        }
    },
    onChange(e) {
        var address = e.currentTarget.dataset.address;
        if (this.data.ifSelect) {
            this.updateSelectAddress(address);
            wx.navigateBack();
        }
    },
    onEditAddress(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/address-edit/index?id=' + id
        });
    },
    onDelAddress(e) {
        wx.jyApp.dialog.confirm({
            message: '确认删除？'
        }).then(() => {
            var id = e.currentTarget.dataset.id;
            wx.jyApp.http({
                url: `/user/address/delete`,
                method: 'post',
                data: {
                    id: id
                }
            }).then((data) => {
                wx.showToast({
                    title: '删除成功'
                });
                this.data.addressList = this.data.addressList.filter((item) => {
                    return item.id != id
                });
                this.setData({
                    addressList: this.data.addressList
                });
                if (this.data.selectAddress && this.data.selectAddress.id == id) {
                    this.updateSelectAddress(null);
                }
            });
        });
    },
    onAddAddress() {
        wx.navigateTo({
            url: '/pages/mall/address-edit/index'
        });
    },
    loadList() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            this.setData({
                addressList: data.list || []
            });
            if (!this.data.selectAddress) {
                this.data.addressList.map((item) => {
                    if (item.isDefault) {
                        this.updateSelectAddress(item);
                    }
                });
            }
        }).finally(() => {
            wx.hideLoading();
        });
    }
})