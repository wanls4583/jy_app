Page({
    data: {
        messageList: []
    },
    onLoad(option) {
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
    loadList() {
        wx.jyApp.http({
            url: '/chat/list',
            data: {
                page: 1,
                limit: 1000
            }
        }).then((data) => {
            this.setData({
                messageList: data.page.list
            });
        });
    }
})