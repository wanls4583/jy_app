/*
 * @Author: lisong
 * @Date: 2020-12-23 15:56:29
 * @Description: 
 */
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    src: {
      type: String,
      value: ''
    },
    poster: {
      type: String,
      value: ''
    }
  },
  data: {
    playVisible: true,
    bottomPlayVisible: false,
    pauseVisible: false,
    id: 'video' + wx.jyApp.utils.getUUID()
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
    _attached() {},
    onReady(e) {
      console.log(e);
      this.videoContext = wx.createVideoContext(this.data.id, this);
    },
    onPlay() {
      this.setData({
        playVisible: false
      });
      var video = wx.jyApp.getTempData('playedVideoContext');
      wx.jyApp.setTempData('playedVideoContext', this.videoContext);
      if (video && video!=this.videoContext) {
        video.pause();
      }
    },
    onPause() {
      this.setData({
        playVisible: true
      });
    },
    onEnd() {
      this.setData({
        playVisible: true,
      });
    },
    onFull(e) {
      if (e.detail.fullScreen) {
        if (!this.data.playVisible) {
          this.videoContext.play();
        }
        this.setData({
          bottomPlayVisible: true
        });
      } else {
        this.setData({
          bottomPlayVisible: false
        });
      }
    },
    onClick() {
      if (this.data.playVisible) {
        this.play();
      } else {
        this.pause();
      }
    },
    play() {
      this.videoContext.play();
    },
    pause() {
      this.videoContext.pause();
    }
  }
})