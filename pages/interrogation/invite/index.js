/*
 * @Author: lisong
 * @Date: 2020-09-08 20:40:56
 * @Description: 
 */
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
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo', 'configData'],
        });
        this.storeBindings.updateStoreBindings();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onOpenWebview(e) {
        wx.jyApp.utils.openWebview(e);
    },
    onShareAppMessage: function (res) {
        return {
            title: '医生邀请',
            path: '/pages/index/index?type=1&dId=' + this.data.doctorInfo.id,
            imageUrl: '/image/logo.png'
        }
    },
    onShowShare() {
        this.setData({
            shareVisble: !this.data.shareVisble
        });
    },
    onQrcode(e) {
        wx.navigateTo({
            url: `/pages/interrogation/qrcode-share/index?source=INDEX&uId=${this.data.userInfo.id}&did=${this.data.doctorInfo.id}`
        });
        this.setData({
            shareVisble: false
        });
    }
})