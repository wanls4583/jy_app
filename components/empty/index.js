Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    description: {
      type: String,
      value: '暂无内容'
    },
  },
  data: {
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
  }
})