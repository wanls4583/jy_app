const app = getApp()

Page({
    data: {
        orderList: [{
            id: 1,
            title: '商品名称',
            orderDate: '2020-09-09 11:11:11',
            orderNum: '4423121545645211',
            money: 100,
            status: '未支付',
            patient: {
                name: '张三',
                sex: '男',
                age: 31,
                height: '170',
                weight: 100
            }
        }]
    },
    onLoad() {

    }
})