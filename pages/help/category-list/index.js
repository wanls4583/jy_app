Page({
    data: {
        list: [],
    },
    onLoad() {
        this.loadList();
    },
    onUnload() {},
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onClickCategory(e) {
        var item = e.currentTarget.dataset.item;
        wx.jyApp.setTempData('questionList', item);
        wx.jyApp.utils.navigateTo({
            url: '/pages/help/question-list/index'
        });
    },
    loadList() {
        wx.jyApp.http({
            url: '/question/list'
        }).then((data) => {
            this.setData({
                list: data.list
            });
        });
    }
})