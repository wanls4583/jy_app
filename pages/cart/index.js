import http from '../../utils/request';
import { store } from '../../store/index'
import { createStoreBindings } from 'mobx-miniprogram-bindings';

Page({
    data: {
        address: {
            name: '姓名',
            phone: '13875260179',
            detail: '详细地址详细地址详细地址详细地址详细地址详细地址'
        }
    },
    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['cart', 'cartTotalMoney', 'cartNum'],
            actions: ['addCart', 'addCartNum', 'reduceCartNum', 'clearCart'],
        });
    }
})