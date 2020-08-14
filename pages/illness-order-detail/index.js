const app = getApp()

Page({
    data: {
        order: {
            title: '商品信息',
            money: 100,
            orderNum: '125432113',
            status: '未支付',
            ceateTime: '2018-08-08',
            patient: {
                name: '张三',
                sex: '男',
                age: 31,
                height: '170',
                weight: 100
            }
        }
    },
    onLoad() {

    }
})