const app = getApp()

Page({
    data: {
        addressList: [],
        checkedId: 1,
        ifSelect: false
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['selectAddress'],
            actions: ['updateSelectAddress'],
        });
    },
    onShow() {
        this.loadList();
        this.setData({
            ifSelect: wx.jyApp.selectAddressFlag
        });
        wx.jyApp.selectAddressFlag = false;
    },
    onChange(e) {
        var address = e.currentTarget.dataset.address;
        this.setData({
            checkedId: address.id
        });
        if (this.data.ifSelect) {
            this.updateSelectAddress(address);
        }
    },
    editAddress(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/address-edit/index?id=' + id
        });
    },
    delAddress(e) {
        var id = e.currentTarget.dataset.id;
    },
    addAddress() {
        wx.navigateTo({
            url: '/pages/address-edit/index'
        });
    },
    loadList() {
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            this.setData({
                addressList: data.list || []
            });
            if (!this.selectAddress) {
                this.data.addressList.map((item) => {
                    if (item.isDefault) {
                        this.updateSelectAddress(item);
                    }
                });
            }
        });
    }
})