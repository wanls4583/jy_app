/*
 * @Author: lisong
 * @Date: 2021-01-12 17:09:37
 * @Description: 
 */
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    titles: {
      type: Array,
      value: []
    },
    step: {
      type: Number,
      value: 1
    }
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