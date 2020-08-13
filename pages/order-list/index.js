const app = getApp()

Page({
    data: {
        orderList: [{
            list: [{
                name: '商品',
                url: 'https://p0.ssl.img.360kuai.com/dmfd/279_130_75/t0192175c6834d3154d.webp',
                num: 100,
                price: 100000
            }],
            money: 0,
            orderNum: '125432113',
            status: '已支付'
        }],
    },
    onLoad() {

    }
})