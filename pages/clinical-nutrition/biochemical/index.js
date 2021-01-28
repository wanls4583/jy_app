/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
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
        activeNames: [],
        stopRefresh: false
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

        },
        onCollapseChange(event) {
            var activeNames = event.detail;
            if (activeNames.length) {
                activeNames = [activeNames[activeNames.length - 1]];
            }
            this.setData({
                activeNames: activeNames,
            });
        },
    }
})