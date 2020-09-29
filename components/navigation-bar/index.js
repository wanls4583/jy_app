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
    },
    safe: {
      type: Boolean,
      value: false,
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
      var bRect = wx.jyApp.utils.getMenuRect();
      var systemInfo = wx.getSystemInfoSync();
      var showBack = pages.length > 1;
      this.setData({
        systemInfo: systemInfo,
        showBack: showBack,
        menuRect: bRect,
        paddingLeft: this.properties.back && showBack ? 40 : 0,
        paddingRight: this.properties.safe ? (systemInfo.screenWidth - bRect.left) : (this.properties.back && showBack ? 40 : 0)
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