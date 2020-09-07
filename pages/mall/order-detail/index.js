Page({
    data: {
        order: {}
    },
    onLoad(option) {
        this.loadInfo(option.id);
    },
    loadInfo(id) {
        wx.showLoading({
            title: '加载中...'
        });
        wx.jyApp.http({
            url: `/order/info/${id}`
        }).then((data) => {
            data.order._status = wx.jyApp.constData.mallOrderStatusMap[data.order.status];
            data.order.goods.map((_item) => {
                _item.goodsPic = _item.goodsPic && _item.goodsPic.split(',')[0] || '';
                _item._unit = _item.type == 2 ? '份' : wx.jyApp.constData.unitChange[_item.unit];
            });
            switch (data.order.status) {
                case 0:
                case 5:
                case 6: data.order.statusColor = 'danger-color'; break;
                case 1:
                case 7:
                case 8: data.order.statusColor = 'success-color'; break;
            }
            this.setData({
                order: data.order
            });
        }).finally(() => {
            wx.hideLoading();
        });
    }
})