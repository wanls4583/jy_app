Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    label: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    },
    titleWidth: {
      type: String,
      value: '6.2em'
    },
    fontColor: {
      type: String,
      value: '#333'
    }
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