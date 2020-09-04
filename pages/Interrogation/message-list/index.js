Page({
    data: {
        messageList: [],
        stopRefresh: false,
        page: 1,
        totalPage: -1
    },
    onLoad(option) {

    },
    onShow() {
        this.loadList();
    },
    onClickMsg(e) {
        var id = e.currentTarget.dataset.id;
        var roomId = e.currentTarget.dataset.roomid;
        wx.navigateTo({
            url: '/pages/interrogation/chat/index?roomId=' + roomId
        });
        wx.jyApp.http({
            url: '/chat/resetNotReadNum',
            method: 'post',
            data: {
                id: id
            }
        });
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    loadList(refresh) {
        if (refresh) {
            this.setData({
                page: 1,
                totalPage: -1,
                messageList: []
            });
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: this.data.page,
                limit: 20
            }
        }).then((data) => {
            this.setData({
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
                messageList: this.data.messageList.concat(data.page.list)
            });
        }).finally(() => {
            this.setData({
                stopRefresh: true
            });
            this.request = null;
        });
    }
})