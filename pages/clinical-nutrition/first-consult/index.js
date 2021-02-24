/*
 * @Author: lisong
 * @Date: 2021-01-27 16:08:59
 * @Description: 
 */
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    properties: {
        patient: {
            type: Object,
            value: {}
        },
        option: {
            type: Object,
            value: {}
        },
    },
    data: {

    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function () {
        this._attached();
    },
    methods: {
        _attached() {

        }
    }
})