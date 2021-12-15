Page({
    data: {
        info: {},
    },
    onLoad(option) {
        wx.setNavigationBarTitle({
            title: option.name
        });
        this.id = option.id;
        this.loadInfo(this.id);
    },
    onUnload() {},
    onChangeNum(e) {
        var resolve = e.currentTarget.dataset.resolve;
        wx.jyApp.http({
            url: `/question/update`,
            method: 'post',
            data: {
                id: this.id,
                resolve: resolve,
            }
        }).then((data) => {
            this.setData({
                'info.resolve': resolve
            });
        });
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/question/info/${id}`
        }).then((data) => {
            this.setData({
                info: data.question
            });
        });
    }
})