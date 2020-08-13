const app = getApp()

Page({
    data: {
        order: {
            list: [{
                name: '商品',
                url: 'https://p0.ssl.img.360kuai.com/dmfd/279_130_75/t0192175c6834d3154d.webp',
                num: 100,
                price: 100000
            }],
            money: 0,
            orderNum: '125432113',
            status: '未支付',
            ceateTime: '2018-08-08'
        },
        address: {
            name: '李四',
            phone: '13875260177',
            detail: '详细地址'
        }
    },
    onLoad() {

    }
})