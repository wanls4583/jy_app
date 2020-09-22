Page({
    data: {
        url: ''
    },
    onLoad(option) {
        var url = decodeURIComponent(option.url);
        this.setData({
            url: url
        })
    }
})