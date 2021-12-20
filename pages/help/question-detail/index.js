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
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.data.info.content && that.editorCtx.setContents({
                html: that.data.info.content
            });
        }).exec()
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/question/info/${id}`
        }).then((data) => {
            this.setData({
                info: data.question
            });
            if (this.editorCtx) {
                this.editorCtx.setContents({
                    html: data.question.content
                });
            }
        });
    }
})