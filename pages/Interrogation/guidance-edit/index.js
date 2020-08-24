Page({
    data: {
        guidence: '',
        prductList: []
    },
    onLoad(option) {

    },
    onInput(e) {
        this.setData({
            guidence: e.detail.value
        });
    }
})