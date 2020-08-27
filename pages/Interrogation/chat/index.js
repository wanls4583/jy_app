import Utils from '../../../utils/util.js';

Page({
    data: {
        patient: {},
        currentUser: {},
        talker: {},
        chatList: [], //聊天内容
        inputBottom: 0,
        inputFoucus: false,
        panelVisible: false,
        inputValue: '',
        domId: '',
        inputHeight: 60,
        panelHeight: 115,
        actionVisible: false,
        roomId: '',
        consultOrderId: '',
        earlistId: '',
        lastestId: '',
        sendedIds: [],
        totalPage: 0
    },
    onLoad(option) {
        if (wx.onKeyboardHeightChange) {
            wx.onKeyboardHeightChange((res) => {
                if (!this.data.inputFoucus) {
                    this.setData({
                        inputBottom: res.height
                    });
                }
            });
        }
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.initRoom(option.roomId).then(() => {
            this.getNewHistory();
        });
    },
    onUnload() {
        clearTimeout(this.pollTimer);
    },
    initRoom(roomId) {
        return wx.jyApp.http({
            url: '/chat/room/info/' + roomId
        }).then((data) => {
            data.patient._sex = data.patient.sex == 1 ? '男' : '女';
            this.setData({
                roomId: data.chatRoom.roomId,
                currentUser: data.currentUser,
                talker: data.talker,
                patient: data.patient
            });
            wx.hideLoading();
        });
    },
    foucus: function (e) {
        this.setData({
            inputBottom: e.detail.height,
            inputFoucus: true,
            panelVisible: false
        });
    },
    blur: function (e) {
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
        }
    },
    onInput(e) {
        this.setData({
            inputValue: e.detail.value
        });
    },
    //发文字消息
    onSend() {
        this.getNewHistory().then(() => {
            var inputValue = this.data.inputValue;
            var chat = {
                sendStatus: 'sending',
                sender: this.data.currentUser.id,
                avatarUrl: this.data.currentUser.avatarUrl,
                type: 1,
                txt: inputValue,
                sendTime: new Date().getTime(),
                domId: 'id-' + Utils.getUUID()
            };
            this.data.chatList.push(chat);
            this.setData({
                chatList: this.data.chatList,
                inputValue: ''
            }, () => {
                this.setData({
                    domId: chat.domId
                })
            });
            this.sendMsg(1, chat);
        });
    },
    //重发文字消息
    onResend(e) {
        var index = e.currentTarget.dataset.index;
        var chat = this.data.chatList[index];
        this.sendMsg(1, chat);
    },
    //发送图片
    onChooseImage() {
        var self = this;
        this.onShowPanel();
        wx.chooseImage({
            success(res) {
                var uploadingChats = [];
                if (res.errMsg == 'chooseImage:ok') {
                    res.tempFilePaths.map((item) => {
                        var obj = {
                            sender: self.data.currentUser.id,
                            type: 2,
                            txt: item,
                            sendStatus: 'uploading',
                            progress: 10,
                            sendTime: new Date().getTime(),
                            domId: 'id-' + Utils.getUUID()
                        };
                        self.data.chatList.push(obj);
                        uploadingChats.push(obj);
                    });
                    self.setData({
                        chatList: self.data.chatList.concat([])
                    }, () => {
                        self.setData({
                            domId: self.data.chatList[self.data.chatList.length - 1].domId
                        });
                    });
                    self.uploadingFiles(uploadingChats);
                }
            }
        });
    },
    //重发图片
    onResendImg(e) {
        var index = e.currentTarget.dataset.index;
        var chat = this.data.chatList[index];
        if (chat.sendStatus == 'uploadFail') {
            this.setSendStatus(chat, 'uploading');
            this.uploadingFiles([chat]);
        } else {
            this.sendMsg(2, chat);
        }
    },
    //加载更多
    onPre() {
        this.getPreHistory();
    },
    //查看问诊单
    onClickInterrogationOrder(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/apply-order-detail/index?type=interrogation&id=' + id
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
            return item.type == 2;
        });
        picList = picList.map((item) => {
            return item.txt;
        });
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: picList // 需要预览的图片http链接列表
        });
    },
    //申请开指导
    onClickApply() {
        this.setData({
            actionVisible: true,
            panelVisible: false
        });
    },
    onCancelAction() {
        this.setData({
            actionVisible: false,
            panelVisible: false
        });
    },
    //申请开指导
    onApply() {
        wx.jyApp.http({
            url: '/apply/save',
            method: 'post',
            data: {
                id: this.data.consultOrderId
            }
        }).then(() => {
            this.setData({
                actionVisible: false
            });
            this.getNewHistory();
        });
    },
    //设置消息发送状态
    setSendStatus(chat, status) {
        var index = this.data.chatList.indexOf(chat);
        chat.sendStatus = status;
        this.setData({
            [`chatList[${index}]`]: chat
        });
    },
    //上传图片
    uploadingFiles(uploadingChats) {
        var self = this;
        self.taskMap = self.taskMap || {};
        uploadingChats.map((item) => {
            self.taskMap[item.domId] = wx.uploadFile({
                url: 'https://dev.juyuanyingyang.com/ihospital/app/api/oss/upload?token=' + wx.getStorageSync('token'),
                filePath: item.txt,
                name: 'file',
                header: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                success(res) {
                    var data = {};
                    try {
                        JSON.parse(res.data)
                    } catch (e) {
                        data = {};
                    }
                    delete self.taskMap[item.domId];
                    if (data.url) {
                        item.txt = data.url;
                        self.sendMsg(2, item);
                    } else {
                        self.setSendStatus(item, 'uploadFail');
                    }
                },
                fail() {
                    delete self.taskMap[item.domId];
                    self.setSendStatus(item, 'uploadFail');
                }
            });
            self.taskMap[item.domId] && self.taskMap[item.domId].onProgressUpdate((data) => {
                var index = self.data.chatList.indexOf(item);
                item.progress = data.progress;
                self.setData({
                    [`chatList[${index}]`]: item
                });
            });
        });
    },
    //发送消息请求
    sendMsg(type, chat) {
        this.setSendStatus(chat, 'sending');
        wx.jyApp.http({
            url: '/chat/history/send',
            method: 'post',
            data: {
                type: type,
                txt: chat.txt,
                roomId: this.data.roomId
            }
        }).then((data) => {
            this.setSendStatus(chat, 'sended');
            this.data.sendedIds.push(data.id);
        });
    },
    //轮询消息
    getNewHistory() {
        return this.getHistory();
    },
    //上翻消息
    getPreHistory() {
        return this.getHistory(true);
    },
    getHistory(ifPre) {
        return wx.jyApp.http({
            url: '/chat/history/poll',
            method: 'get',
            data: {
                page: 1,
                limit: 30,
                earlistId: ifPre && this.data.earlistId || '',
                lastestId: !ifPre && this.data.lastestId || '',
                roomId: this.data.roomId
            }
        }).then((data) => {
            var list = data.page.list;
            var originLength = this.data.chatList.length;
            list.reverse();
            list.map((item) => {
                item.domId = 'id-' + item.id;
            });
            this.data.chatList = this.data.chatList.filter((item) => {
                return this.data.sendedIds.indexOf(item.id) == -1;
            });
            if (ifPre) {
                this.data.chatList = list.concat(this.data.chatList);
            } else {
                this.data.chatList = this.data.chatList.concat(list);
            }
            this.setData({
                chatList: this.data.chatList
            }, () => {
                if (list.length && originLength < this.data.chatList.length) {
                    if (ifPre) {
                        this.setData({
                            domId: list[list.length - 1].domId
                        });
                    } else {
                        this.setData({
                            domId: this.data.chatList[this.data.chatList.length - 1].domId
                        });
                    }
                }
            });
            if (!ifPre && list.length) {
                this.setData({
                    lastestId: list[list.length - 1].id,
                });
            }
            if (ifPre || !this.data.earlistId && list.length) {
                this.data.earlistId = list[0].id;
                this.setData({
                    totalPage: data.page.totalPage
                });
            }
            this.pollTimer = setTimeout(() => {
                this.getNewHistory();
            }, 3000);
        }).catch((err) => {
            console.log(err)
            this.pollTimer = setTimeout(() => {
                this.getNewHistory();
            }, 3000);
        });
    }
})