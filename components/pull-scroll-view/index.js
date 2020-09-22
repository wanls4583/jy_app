const app = getApp();
Component({
    properties: {
        style: {
            type: String,
            value: ''
        },
        refresherBackground: {
            type: String,
            value: ''
        },
        refresherDefaultStyle: {
            type: String,
            value: 'black'
        },
        //全屏时适配顶部状态栏
        fullScreen: {
            type: Boolean,
            value: false
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
        }
    },
    data: {
        enableDefault: true
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function(option) {
        this._attached();
    },
    methods: {
        _attached() {
            var self = this;
            wx.getSystemInfo({
                success: function(res) {
                    self.setData({
                        enableDefault: self._compareVersion(res.SDKVersion, '2.10.1') >= 0
                    });
                }
            });
        },
        _compareVersion(v1, v2) {
            v1 = v1.split('.')
            v2 = v2.split('.')
            const len = Math.max(v1.length, v2.length)

            while (v1.length < len) {
                v1.push('0')
            }
            while (v2.length < len) {
                v2.push('0')
            }

            for (let i = 0; i < len; i++) {
                const num1 = parseInt(v1[i])
                const num2 = parseInt(v2[i])

                if (num1 > num2) {
                    return 1
                } else if (num1 < num2) {
                    return -1
                }
            }
            return 0
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