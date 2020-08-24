import { orderStatusMap } from '../../../utils/data';
Page({
    data: {
        order: {},
        address: {}
    },
    onLoad(option) {
        this.loadInfo(option.id);
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/emall/app/api/order/info/${id}`
        }).then((data) => {
            
        });
    }
})