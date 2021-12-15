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
        wx.setNavigationBarTitle({
            title: data.categoryName
        });
    },
    onUnload() {},
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
})