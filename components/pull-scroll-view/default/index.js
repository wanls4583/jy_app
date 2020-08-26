const app = getApp();
Component({
    externalClasses: ['external-classes'],
    properties: {
        style: {
            type: String,
            value: ''
        },
        scrollTop: {
            type: Number,
            value: 0,
            observer: function (newVal, oldVal) {
                this.properties.scrollTop = newVal + 1;
                if (!this.hasAttached) {
                    return;
                }
                //使下次相同的scrollTop能触发observer
                this.setData({
                    _scrollTop: newVal
                });
            }
        },
        scrollToTop: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                //使下次能再触发observer
                this.properties.scrollToTop = false;
                this.toTop();
            }
        },
        stopRefresh: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                clearTimeout(this.stopTimer);
                this.stopTimer = setTimeout(() => {
                    this.setData({
                        refresherTriggered: false
                    });
                    this.refreshing = false;
                }, 1000);
            }
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
        _scrollTop: 0,
        refresherTriggered: true,
        animation: true,
    },
    lifetimes: {
        attached() {
            wx.nextTick(() => {
                this._attached();
            });
        }
    },
    attached: function (option) {
        wx.nextTick(() => {
            this._attached();
        });
    },
    methods: {
        _attached() {
            this.setData({
                _scrollTop: this.properties.scrollTop
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
        toTop() {
            this.setData({
                _scrollTop: this.data._scrollTop == 0 ? 1 : 0
            });
        },
        refresh() {
            if (this.refreshing) {
                return;
            }
            this.refreshing = true;
            this.triggerEvent('refresh');
        },
    }
})