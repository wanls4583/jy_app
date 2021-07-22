/*
 * @Author: lisong
 * @Date: 2020-09-08 17:47:15
 * @Description: 
 */
Page({
    data: {
        dataList: [],
        stopRefresh: false,
        totalCount: -1,
        statusMap: {
            1: '提现中',
            2: '已到账',
            3: '提现失败',
        }
    },
    onLoad() {
        this.loadList();
    },
    onRefresh() {
        this.loadList();
    },
    loadList() {
        this.setData({
            totalCount: -1,
            dataList: []
        });
        this.request && this.request.requestTask.abort();
        this.request = wx.jyApp.http({
            url: '/doctorwithdraw/list'
        });
        this.request.then((data) => {
            data.list = data.list || [];
            data.list.map((item) => {
                item._status = this.data.statusMap[item.status];
                item._nickname = item.nickname;
                if (item.bankName) {
                    item._nickname = item.bankName + '(' + item.bankCardNumber.slice(item.bankCardNumber.length - 4) + ')';
                }
            });
            this.setData({
                dataList: data.list,
                totalCount: data.list.length
            })
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.request = null;
        });
    }
})