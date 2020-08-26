const app = getApp();
Component({
    properties: {
        externalClasses: {
            type: String,
            value: ''
        },
        style: {
            type: String,
            value: ''
        },
        //全屏时适配顶部状态栏
        fullScreen: {
            type: Boolean,
            value: false
        },
        scrollTop: {
            type: Number,
            value: 0
        },
        scrollToTop: {
            type: Boolean,
            value: false
        },
        stopRefresh: {
            type: Boolean,
            value: false
        },
        lowerThreshold: {
            type: String,
            value: '100px',
        },
        upperThreshold: {
            type: String,
            value: '100px',
        },
        topHeight: {
            type: Number,
            value: 60
        }
    },
    data: {
        SDKVersion: ''
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function (option) {
        this._attached();
    },
    methods: {
        _attached() {
            var self = this;
            wx.getSystemInfo({
                success: function (res) {
                    self.setData({
                        SDKVersion: res.SDKVersion
                    });
                }
            });
        },
        onScroll(e) {
            this.triggerEvent('scroll', e.detail);
        },
        onScrolltolower(e) {
            this.triggerEvent('scrolltolower', e.detail);
        },
        onScrolltoupper(e) {
            this.triggerEvent('scrolltoupper', e.detail);
        },
        onRefresh() {
            this.triggerEvent('refresh');
        }
    }
})