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
        scrollToTop: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                //使下次能再触发observer
                this.properties.scrollToTop = false;
                this.toTop();
            }
        },
        scrollTop: {
            type: Number,
            value: 0,
            observer: function (newVal, oldVal) {
                this.scrollTop(newVal);
                //使下次能再触发observer
                this.properties.scrollTop = Math.random();
            }
        },
        stopRefresh: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                //使下次能再触发observer
                this.properties.stopRefresh = false;
                clearTimeout(this.stopTimer);
                this.stopTimer = setTimeout(() => {
                    this.setData({
                        refresherTriggered: false
                    });
                    this.refreshing = false;
                }, 500);
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
        animation: false,
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
        scrollTop(top) {
            this.setData({
                _scrollTop: top
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