Page({
    data: {

    },
    onLoad: function (options) {
        this.type = options.type;
        this.id = options.id;
    },
    //查看详情
    onDetail() {
        if (this.type == 'mallOrder') {
            wx.jyApp.utils.navigateTo({
                url: '/pages/mall/order-detail/index?id=' + this.id
            });
        }
    }
})