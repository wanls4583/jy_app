const app = getApp();
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    autoBack: {
      type: Boolean,
      value: true,
    },
    back: { //是否显示返回
      type: Boolean,
      value: true,
    },
    holder: { //导航栏是否占位
      type: Boolean,
      value: true,
    },
    background: { //导航栏背景色
      type: String,
      value: '#fff'
    },
    color: {
      type: String,
      value: 'black'
    },
    title: { //导航栏标题
      type: String,
      value: ''
    },
    fixed: { //导航栏是否fixed定位
      type: Boolean,
      value: true
    },
    fontSize: {
      type: String,
      value: '28rpx'
    }
  },
  data: {
    showBack: true,
    navHeight: 0,
    systemInfo: null,
    menuRect: { left: 0 },
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
      var pages = getCurrentPages();
      var systemInfo = wx.getSystemInfoSync();
      var bRect = wx.getMenuButtonBoundingClientRect() || {};
      bRect.top = bRect && bRect.top || 28;
      bRect.right = bRect && bRect.right || systemInfo.screenWidth - 10;
      bRect.right = bRect && bRect.left || systemInfo.screenWidth - 90;
      bRect.height = bRect && bRect.height || 32;
      bRect.width = bRect && bRect.width || 87;
      this.setData({
        systemInfo: systemInfo,
        showBack: pages.length > 1,
        menuRect: bRect,
        navHeight: (bRect.top - systemInfo.statusBarHeight) * 2 + bRect.height
      });
    },
    back() {
      if (this.properties.autoBack) {
        wx.navigateBack({
          delta: 1
        });
      }
      this.triggerEvent('back');
    }
  }
})