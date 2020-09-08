Page({
    data: {
        steps: [{
            text: '步骤一',
            desc: '发送邀请给好友'
        }, {
            text: '步骤二',
            desc: '好友通过链接或二维码进入钜元营养'
        }, {
            text: '步骤三',
            desc: '好友认证成为医生'
        }],
        options: [
            { name: '微信', icon: 'wechat' },
            { name: '二维码', icon: 'qrcode' }
        ],
        shareVisble: false
    },
    onLoad() {},
    onShowShare() {
        this.setData({
            shareVisble: !this.data.shareVisble
        });
    },
    onSelect(e) {
        if (e.detail.index == 0) {

        } else {
            wx.navigateTo({
                url: '/pages/qrcode-share/index'
            });
        }
        this.setData({
            shareVisble: false
        });
    }
})