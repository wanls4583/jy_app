Page({
    data: {
        categoryName: '',
        list: [],
    },
    onLoad() {
        var data = wx.jyApp.getTempData('questionList');
        this.setData({
            categoryName: data.categoryName,
            list: data.items
        });
    },
    onUnload() {},
    onClickItem(e) {
        var item = e.currentTarget.dataset.item;
    },
})