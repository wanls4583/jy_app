Page({
    data: {
        order: {
            title: '商品信息',
            money: 100,
            orderNum: '125432113',
            status: '未支付',
            ceateTime: '2018-08-08',
            diagnosis: '营养诊断',
            deliveryPay: '10',
            money: '500',
            doctorName: '李医生',
            patient: {
                name: '张三',
                sex: '男',
                age: 31,
                height: '170',
                weight: 100
            },
            productList: [{
                goodsName: '商品名称',
                goodsPic: 'https://p0.ssl.img.360kuai.com/t01e9b0ee675fb9a2f4.webp',
                frequency: 2,
                price: 125,
                usage: '3天，一天三次',
                remark: '备注',
            }]
        }
    },
    onLoad() {

    }
})