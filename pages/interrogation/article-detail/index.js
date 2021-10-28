Page({
    data: {
        editorHeight: 300,
        title: '',
        content: '',
        info: {},
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadInfo(option.id);
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
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
            if (this.editorCtx) {
                this.editorCtx.setContents({
                    html: data.article.content
                });
            }
            this.setData({
                title: data.article.title,
                content: data.article.content,
                info: data.article
            });
        });
    },
})