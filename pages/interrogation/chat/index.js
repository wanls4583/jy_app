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
        totalPage: 0,
        applyOrderMap: {},
        status: 0 //1:聊天未关闭，0:聊天已关闭
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
        if (option.id) {
            return wx.jyApp.http({
                url: '/chat/init',
                method: 'post',
                data: {
                    id: option.id
                }
            }).then((data) => {
                this.initRoom(data);
                this.getNewHistory();
            });
        } else if (option.roomId) {
            return wx.jyApp.http({
                url: '/chat/room/info/' + option.roomId
            }).then((data) => {
                this.initRoom(data);
                this.getNewHistory();
            });
        }
    },
    onShow() {
        this.stopPoll = false;
        if (this.data.roomId) {
            this.getNewHistory();
        }
    },
    onHide() {
        this.stopPoll = true;
        clearTimeout(this.pollTimer);
    },
    onUnload() {
        this.stopPoll = true;
        clearTimeout(this.pollTimer);
    },
    initRoom(data) {
        data.patient._sex = data.patient.sex == 1 ? '男' : '女';
        this.setData({
            roomId: data.chatRoom.roomId,
            currentUser: data.currentUser,
            talker: data.talker,
            patient: data.patient,
            status: data.chatRoom.status,
            consultOrderId: data.chatRoom.consultOrderId
        });
        wx.hideLoading();
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
        if (this.data.status != 1) {
            return;
        }
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
            return item.type == 2 && !item.failImgUrl;
        });
        picList = picList.map((item) => {
            return item.txt;
        });
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: picList // 需要预览的图片http链接列表
        });
    },
    //点击[申请]开指导按钮
    onClickApply() {
        if (this.data.currentUser.role != 'DOCTOR') { //患者申请指导
            this.setData({
                actionVisible: true
            });
        } else { //医生开指导
            this.onGuide();
        }
        this.setData({
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
    //开指导
    onGuide() {
        wx.navigateTo({
            url: '/pages/interrogation/guidance-edit/index?id=' + this.data.consultOrderId
        });
    },
    //点击指导单详情按钮
    onClickGuideOrderDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/guidance-order-detail/index?id=' + id
        });
    },
    //图片加载失败
    onImgLoadError(e) {
        var index = e.currentTarget.dataset.index;
        var chat = this.data.chatList[index];
        chat.failImgUrl = '/image/icon_pic_loading_failed.png';
        this.setData({
            [`chatList[${index}]`]: chat
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
                        data = JSON.parse(res.data);
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
        }).catch(() => {
            this.setSendStatus(chat, 'sendFail');
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
    //请求消息记录
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
            if (this.data.status == 1 && !this.stopPoll) { //聊天是否未关闭
                clearTimeout(this.pollTimer);
                this.pollTimer = setTimeout(() => {
                    this.getNewHistory();
                }, 3000);
            }
            if (!list.length) {
                return;
            }
            list.reverse();
            if (ifPre) { //上翻记录
                this.data.chatList = list.concat(this.data.chatList);
            } else {
                this.data.chatList = this.data.chatList.concat(list);
            }
            this.data.chatList = this.data.chatList.filter((item) => {
                return this.data.sendedIds.indexOf(item.id) == -1;
            });
            list.map((item) => {
                item.domId = 'id-' + item.id; //id用来定位最新一条信息
                if (item.type == 4 && item.orderApplyVO) {
                    item.orderApplyVO._status = wx.jyApp.constData.orderStatusMap[item.orderApplyVO.status];
                }
                if (item.type == 5 && item.nutrionOrderChatVo) {
                    item.nutrionOrderChatVo._status = wx.jyApp.constData.orderStatusMap[item.nutrionOrderChatVo.status];
                }
            });
            list.map((item) => {
                if (item.type == 0 && item.associateId) { //系统消息动态更改申请单和指导单状态
                    var obj = null
                    try {
                        obj = JSON.parse(item.txt);
                    } catch (e) {
                        obj = {};
                    }
                    this.data.chatList.map((_item) => {
                        if (_item.type == obj.type && item.associateId == _item.associateId) {
                            var vo = null;
                            if (obj.type == 4) {
                                vo = _item.orderApplyVO || {};
                            }
                            if (obj.type == 5) {
                                vo = _item.nutrionOrderChatVo || {};
                            }
                            vo._status = wx.jyApp.constData.orderStatusMap[obj.status];
                            _item.vo = vo;
                        }
                    });
                    var index = this.data.chatList.indexOf(item);
                    this.data.chatList.splice(index, 1);
                }
            });
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
        }).catch((err) => {
            console.log(err)
            if (this.data.status == 1 && !this.stopPoll) {
                clearTimeout(this.pollTimer);
                this.pollTimer = setTimeout(() => {
                    this.getNewHistory();
                }, 3000);
            }
        });
    },
})