const app = getApp()

Page({
    data: {
        addressList: [{
                id: 1,
                name: '李四',
                phone: '13875260171',
                detail: '地址详情'
            },
            {
                id: 2,
                name: '张三',
                phone: '13875260171',
                detail: '地址详情'
            }
        ],
        checkedId: 1
    },
    onLoad() {

    },
    onChange(e) {
        this.setData({
            checkedId: e.detail.value
        });
    }
})