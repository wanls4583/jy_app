Page({
    data: {
        showTextPrice: false,
        showGuidePrice: false,
        textPrice: 40,
        guidePrice: 40,
        editTextPrice: 40,
        editGuidePrice: 40
    },
    onLoad() {

    },
    onSwitchChange() {

    },
    onClickTextPrice() {
        this.setData({
            showTextPrice: true
        });
    },
    onClickGuidePrice() {
        this.setData({
            showGuidePrice: true
        });
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail.value
        });
    },
    confirmTextPrice(e) {
        this.setData({
            textPrice: this.data.editTextPrice,
            showTextPrice: false
        });
    },
    confirmGuidPrice(e) {
        this.setData({
            guidePrice: this.data.editGuidePrice,
            showGuidePrice: false
        });
    }
})