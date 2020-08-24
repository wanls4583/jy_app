import Utils from '../../../utils/util.js';

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
        domId: '',
        inputHeight: 60,
        panelHeight: 115,
        actionVisible: false
    },
    onLoad() {
        if (wx.onKeyboardHeightChange) {
            wx.onKeyboardHeightChange((res) => {
                if (!this.data.inputFoucus) {
                    this.setData({
                        inputBottom: res.height
                    });
                }
            });
        }
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
            // this.setData({
            //     inputFoucus: true
            // });
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
            type: 'start',
            msg: this.data.inputValue,
            timestamp: new Date().getTime(),
            domId: 'id-' + Utils.getUUID()
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
    //点击图片放大
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        var picList = this.data.chatList.filter((item) => {
            return item.type == 'img';
        });
        picList = picList.map((item) => {
            return item.msg;
        });
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: picList // 需要预览的图片http链接列表
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
                            progress: 10,
                            timestamp: new Date().getTime(),
                            domId: 'id-' + Utils.getUUID()
                        };
                        self.data.chatList.push(obj);
                        uploadingFiles.push(obj);
                    });
                    self.setData({
                        chatList: self.data.chatList.concat([])
                    }, () => {
                        self.setData({
                            domId: self.data.chatList[self.data.chatList.length - 1].domId
                        });
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
    },
    //申请开处方
    onClickApplay() {
        this.setData({
            actionVisible: true
        });
    },
    cancelAction() {
        this.setData({
            actionVisible: false
        });
    },
    //开指导
    apply() {
    }
})