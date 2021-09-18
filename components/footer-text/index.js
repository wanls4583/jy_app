Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    style: {
      type: String,
    },
  },
  data: {
    safeBottom: 0
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
      if (!wx.jyApp.systemInfo) {
        wx.jyApp.systemInfo = wx.getSystemInfoSync()
      }
      this.setData({
        safeBottom: wx.jyApp.systemInfo.screenHeight - wx.jyApp.systemInfo.safeArea.bottom || 0
      });
    },
  }
})