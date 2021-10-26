Page({
    data: {
        editorHeight: 300,
        title: '',
        content: '',
    },
    onLoad(option) {
        this.loadInfo(option.id);
        this.updatePosition(0)
    },
    updatePosition(keyboardHeight) {
        const toolbarHeight = 50
        const titleHeight = 50
        const {
            windowHeight
        } = wx.getSystemInfoSync()
        let editorHeight = windowHeight - titleHeight - toolbarHeight - 20
        this.setData({
            editorHeight: editorHeight,
        });
    },
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.data.content && that.editorCtx.setContents({
                html: that.data.content
            });
        }).exec()
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: '/article/info/' + id,
        }).then((data) => {
            this.setData({
                title: data.article.title,
                content: data.article.content
            });
            if (this.editorCtx) {
                this.editorCtx.setContents({
                    html: this.data.content
                });
            }
        });
    },
})