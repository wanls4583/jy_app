const app = getApp()
import Utils from '../../utils/util.js';

Page({
    data: {
        patient: {
            name: '张三',
            age: 18,
            sex: '男',
            height: 170,
            weight: 50
        },
        userId: 2,
        avatar: '',
        chatList: [], //聊天内容
        inputBottom: 0,
        inputFoucus: false,
        panelVisible: false,
        inputValue: '',
        domId: ''
    },
    onLoad() {

    },
    foucus: function(e) {
        this.setData({
            inputBottom: e.detail.height,
            inputFoucus: true,
            panelVisible: false
        });
    },
    blur: function(e) {
        this.setData({
            inputBottom: 0,
            inputFoucus: false
        });
    },
    onShowPanel() {
        this.setData({
            panelVisible: !this.data.panelVisible
        });
        if (this.data.panelVisible) {
            this.setData({
                inputBottom: 0
            });
        } else {
            this.setData({
                inputFoucus: true
            });
        }
    },
    onInput(e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
    onSend() {
        this.data.chatList.push({
            userId: this.data.userId,
            avatar: this.data.avatar,
            type: 'text',
            msg: this.data.inputValue,
            timestamp: new Date().getTime(),
            domId: Utils.getUUID()
        });
        this.setData({
            chatList: this.data.chatList,
            inputValue: ''
        }, () => {
            this.setData({
                domId: this.data.chatList[this.data.chatList.length - 1].domId
            })
        });
    },
    onClickChatBlock() {
        this.setData({
            panelVisible: false
        });
    },
    onChooseImage() {
        var self = this;
        wx.chooseImage({
            success(res) {
                var uploadingFiles = [];
                if (res.errMsg == 'chooseImage:ok') {
                    res.tempFilePaths.map((item) => {
                        var obj = {
                            userId: 2,
                            type: 'img',
                            msg: item,
                            status: 'uploading',
                            progress: 0,
                            timestamp: new Date().getTime(),
                            domId: Utils.getUUID()
                        };
                        self.data.chatList.push(obj);
                        uploadingFiles.push(obj);
                    });
                    self.setData({
                        chatList: self.data.chatList.concat([])
                    });
                }
                // wx.uploadFile({
                //     url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
                //     filePath: tempFilePaths[0],
                //     name: 'file',
                //     formData: {
                //         'user': 'test'
                //     },
                //     success(res) {
                //         const data = res.data
                //         //do something
                //     }
                // })
            }
        });
    }
})