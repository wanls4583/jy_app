const app = getApp();
Component({
    properties: {
        style: {
            type: String,
            value: ''
        },
        //全屏时适配顶部状态栏
        fullScreen: {
            type: Boolean,
            value: false
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
                //使下次能再触发observer
                this.properties.stopRefresh = false;
                this.setData({
                    finished: true
                });
                clearTimeout(this.returnTimer);
                clearTimeout(this.hideTipTimer);
                //防止频繁刷新，导致画面闪烁
                this.returnTimer = setTimeout(() => {
                    this.toTop();
                }, 500);
                this.hideTipTimer = setTimeout(() => {
                    this.setData({
                        finished: false
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
        statusBarHeight: 0,
        _scrollTop: 0,
        _topHeight: 0,
        topHeight: 60,
        animation: true,
        finished: false,
        minHeight: 0,
        test: '1'
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
            var systemInfo = wx.getSystemInfoSync();
            if (this.properties.fullScreen) {
                this.data.topHeight += systemInfo.statusBarHeight;
            }
            this.setData({
                statusBarHeight: systemInfo.statusBarHeight
            });
            this.getRect().then((res) => {
                this.setData({
                    minHeight: res.height,
                    _topHeight: this.data.topHeight
                }, () => {
                    this.setData({
                        _scrollTop: this.data.topHeight
                    });
                });
            });
            this.hasAttached = true;
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
        touchStart(e) {
            this.touching = true;
            this.startTime = new Date().getTime();
        },
        touchEnd(e) {
            this.endTime = new Date().getTime();
            if (this.refreshing) {
                return;
            }
            _computeRect.bind(this)();

            function _computeRect() {
                return this.getRect().then((res) => {
                    this.touching = false;
                    if (!res) {
                        wx.nextTick(() => {
                            _computeRect.bind(this)();
                        })
                        return;
                    }
                    //时间太短，不触发更新
                    if (res.scrollTop <= 0 && !(this.endTime - this.startTime < 200)) {
                        this.refresh();
                    } else if (res.scrollTop < this.data.topHeight) {
                        this.toTop();
                    }
                });
            }
        },
        toTop() {
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
                this.setData({
                    _scrollTop: this.data._scrollTop == this.data.topHeight ? this.data.topHeight + 1 : this.data.topHeight
                });
            }, 50);
        },
        refresh() {
            if (this.refreshing) {
                return;
            }
            this.refreshing = true;
            this.triggerEvent('refresh');
        },
        getRect() {
            clearTimeout(this.rectTimer);
            this.gettingRect = true;
            return new Promise((reslove, reject) => {
                var query = wx.createSelectorQuery().in(this);
                query.select('.scroll_view').fields({
                    size: true,
                    scrollOffset: true,
                }, (res) => {
                    reslove(res);
                    this.rectTimer = setTimeout(() => {
                        this.gettingRect = false;
                    }, 10);
                });
                query.exec();
            });
        }
    }
})