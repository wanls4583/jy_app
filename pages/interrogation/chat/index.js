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
        status: 0, //1:聊天未关闭，0:聊天已关闭
        limit: 20,
        pages: [],
        pageMap: {},
        pageHeightMap: {},
        bottomId: '',
        nowPageIndex: 0,
        loadButtonHeight: 45, //加载更多按钮的高度
        loading: true, //上翻页加载中状态
    },
    onLoad(option) {
        this.maxImgWidth = 550 / wx.getSystemInfoSync().devicePixelRatio;
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
        this.pollStoped = false;
        if (this.data.roomId) {
            this.getNewHistory();
        }
    },
    onHide() {
        this.stopPoll();
    },
    onUnload() {
        this.stopPoll();
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
        wx.setNavigationBarTitle({
            title: data.talker.nickname
        });
        wx.hideLoading();
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
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
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
        this.request && this.request.requestTask.abort();
        this.getNewHistory().then(() => {
            var inputValue = this.data.inputValue;
            var id = Utils.getUUID();
            var chat = {
                id: id,
                sendStatus: 'sending',
                sender: this.data.currentUser.id,
                avatarUrl: this.data.currentUser.avatarUrl,
                type: 1,
                txt: inputValue,
                sendTime: new Date().getTime(),
                domId: 'id-' + id
            };
            this.addLocalChat(chat);
            this.setData({
                inputValue: ''
            });
            this.sendMsg(1, chat);
        });
    },
    //重发文字消息
    onResend(e) {
        var id = e.currentTarget.dataset.id;
        var chat = this.getChatById(id);
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
                        var id = wx.jyApp.utils.getUUID();
                        var obj = {
                            id: id,
                            sender: self.data.currentUser.id,
                            type: 2,
                            txt: item,
                            sendStatus: 'uploading',
                            progress: 10,
                            sendTime: new Date().getTime(),
                            domId: 'id-' + id
                        };
                        self.addLocalChat(obj);
                        uploadingChats.push(obj);
                    });
                    self.scrollToBottom();
                    self.uploadingFiles(uploadingChats);
                }
            }
        });
    },
    //重发图片
    onResendImg(e) {
        var id = e.currentTarget.dataset.id;
        var chat = this.getChatById(id);
        if (chat.sendStatus == 'uploadFail') {
            this.setSendStatus(chat, 'uploading');
            this.uploadingFiles([chat]);
        } else {
            this.sendMsg(2, chat);
        }
    },
    //添加本地消息
    addLocalChat(chat) {
        var lastPageId = this.data.pages[this.data.pages.length - 1];
        var lastPageList = this.data.pageMap[lastPageId];
        if (lastPageList.length > this.data.limit) {
            this.data.pages.push(chat.id);
            this.setData({
                pages: this.data.pages,
                [`pageMap[${id}]`]: [chat]
            }, () => {
                this.scrollToBottom();
            });
        } else {
            lastPageList.push(chat);
            this.setData({
                [`pageMap[${lastPageId}]`]: lastPageList
            }, () => {
                this.scrollToBottom();
            });
        }
    },
    //加载更多
    onPre() {
        this.getPreHistory();
    },
    onClickChatBlock() {
        this.setData({
            panelVisible: false
        });
    },
    //点击图片放大
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        var picList = [];
        this.data.pages.map((pageId) => {
            this.data.pageMap[pageId].map((item) => {
                if (item.type == 2) {
                    picList.push(item);
                }
            });
        });
        picList = picList.map((item) => {
            return item.originTxt || item.txt;
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
        }).then((data) => {
            this.setData({
                actionVisible: false
            });
            wx.jyApp.utils.pay(data.params).then(() => {
                wx.jyApp.toast('支付成功');
                this.getNewHistory();
            }).catch(() => {
                wx.jyApp.toast('支付失败');
            });
        });
    },
    //图片加载完成
    onImgLoadSuccess(e) {
        var id = e.currentTarget.dataset.id;
        var width = e.detail.width;
        var height = e.detail.height;
        this.chatListMapCall((item, index, pageId) => {
            if (item.id == id) {
                if (width / height > this.maxImgWidth / 120) {
                    item.width = this.maxImgWidth;
                    item.height = height / width * this.maxImgWidth;
                } else {
                    item.height = 120;
                    item.width = width / height * 120;
                }
                this.setData({
                    [`pageMap[${pageId}][${index}]`]: item
                }, () => {
                    if (item.height != 120) {
                        this.setData({
                            [`pageHeightMap[${pageId}]`]: 0
                        }, () => {
                            this.getPageHeight(pageId); //刷新page高度
                        });
                    }
                });
            }
        });
    },
    //图片加载失败
    onImgLoadError(e) {
        var id = e.currentTarget.dataset.id;
        this.chatListMapCall((item, index, pageId) => {
            if (item.id == id) {
                item.failImgUrl = '/image/icon_pic_loading_failed.png';
                this.setData({
                    [`pageMap[${pageId}][${index}]`]: item
                }, () => {
                    if (item.height != 120) {
                        this.setData({
                            [`pageHeightMap[${pageId}]`]: 0
                        }, () => {
                            this.getPageHeight(pageId); //刷新page高度
                        });
                    }
                });
            }
        });
    },
    //计算渲染页码
    onScroll(e) {
        this.computeScroll(e);
    },
    //计算当前渲染的页码，每次渲染三页
    computeScroll(e) {
        var scrollTop = e.detail.scrollTop;
        var height = this.data.loadButtonHeight;
        for (var i = 0; i < this.data.pages.length; i++) {
            var pageId = this.data.pages[i];
            height += this.data.pageHeightMap[pageId];
            if (scrollTop < height) {
                if (this.data.nowPageIndex != i) {
                    this.setData({
                        nowPageIndex: i
                    });
                }
                break;
            }
        }
    },
    //设置消息发送状态
    setSendStatus(chat, status) {
        this.chatListMapCall((item, index, pageId) => {
            if (item.id == chat.id) {
                item.sendStatus = status;
                this.setData({
                    [`pageMap[${pageId}][${index}]`]: item
                });
            }
        });
    },
    //获取每个chat对象并处理
    chatListMapCall(callback) {
        this.data.pages.map((pageId) => {
            this.data.pageMap[pageId].map((item, index) => {
                callback(item, index, pageId);
            });
        });
    },
    //获取page的高度
    getPageHeight(pageId) {
        var self = this;
        this.gettingPageHeight = this.gettingPageHeight || {};
        if (this.gettingPageHeight[pageId]) { //避免同时获取
            return;
        }
        this.gettingPageHeight[pageId] = true;
        if (this.data.pageHeightMap[pageId]) {
            return Promise.resolve(this.data.pageHeightMap[pageId]);
        }
        return new Promise((resolve) => {
            var query = wx.createSelectorQuery()
            query.select('#page-id-' + pageId).boundingClientRect()
            query.exec(function (rect) {
                self.gettingPageHeight[pageId] = false;
                console.log(pageId, rect[0])
                if (rect && rect[0]) {
                    if (!self.data.pageHeightMap[pageId]) {
                        self.setData({
                            [`pageHeightMap[${pageId}]`]: rect[0].height
                        });
                    }
                }
                resolve(self.data.pageHeightMap[pageId]);
            });
        });
    },
    //根据id获取chat对象
    getChatById(id) {
        var chat = null
        this.data.pages.map((pageId) => {
            this.data.pageMap[pageId].map((item) => {
                if (item.id == id) {
                    chat = item;
                }
            });
        });
        return chat;
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
                        item.originTxt = item.txt; //避免请求网络图片
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
                this.chatListMapCall((_item, index, pageId) => {
                    if (_item.id == item.id) {
                        item.progress = data.progress;
                        this.setData({
                            [`pageMap[${pageId}][${index}]`]: item
                        });
                    }
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
    //滚动到底部
    scrollToBottom() {
        var id = wx.jyApp.utils.getUUID();
        this.setData({
            bottomId: 'bottom-id-' + id
        }, () => {
            this.setData({
                domId: 'bottom-id-' + id
            });
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
        if (ifPre || !this.data.pages.length) {
            this.setData({
                loading: true
            });
        }
        this.request = wx.jyApp.http({
            url: '/chat/history/poll',
            method: 'get',
            data: {
                page: 1,
                limit: this.data.limit,
                earlistId: ifPre && this.data.earlistId || '',
                lastestId: !ifPre && this.data.lastestId || '',
                roomId: this.data.roomId
            }
        });
        this.request.then((data) => {
            var list = data.page.list;
            //去除本地已发送的消息
            list = list.filter((item) => {
                return this.data.sendedIds.indexOf(item.id) == -1;
            });
            if (!list.length) {
                return;
            }
            list.reverse();
            list.map((item) => {
                item.domId = 'id-' + item.id; //id用来定位最新一条信息
                if (item.type == 4 && item.orderApplyVO) {
                    item.orderApplyVO._status = wx.jyApp.constData.applyOrderStatusMap[item.orderApplyVO.status];
                }
                if (item.type == 5 && item.nutritionOrderChatVO) {
                    item.nutritionOrderChatVO._status = wx.jyApp.constData.mallOrderStatusMap[item.nutritionOrderChatVO.status];
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
                    this.chatListMapCall((_item) => {
                        _updateStatus(_item, item, obj);
                    });
                    list.map((_item) => {
                        _updateStatus(_item, item, obj);
                    });
                }
            });
            //通过动态消息更新申请单和指导单的状态
            function _updateStatus(_item, item, obj) {
                if (_item.type == obj.type && item.associateId == _item.associateId) {
                    if (obj.type == 4) {
                        _item.orderApplyVO = _item.orderApplyVO || {};
                        _item.orderApplyVO._status = wx.jyApp.constData.applyOrderStatusMap[obj.status];
                    }
                    if (obj.type == 5) {
                        _item.nutritionOrderChatVO = _item.nutritionOrderChatVO || {};
                        _item.nutritionOrderChatVO._status = wx.jyApp.constData.mallOrderStatusMap[obj.status];
                    }
                }
            }
            //去除状态消息
            list = list.filter((item) => {
                return !(item.type == 0 && item.associateId);
            });
            if (ifPre || !this.data.pages.length) { //上翻记录
                var pageId = list[0].id;
                this.data.pages.unshift(pageId);
                this.setData({
                    pages: this.data.pages,
                    [`pageMap[${pageId}]`]: list
                }, () => {
                    if (ifPre) {
                        this.setData({
                            domId: 'page-id-' + this.data.pages[1]
                        });
                    } else {
                        this.scrollToBottom();
                    }
                    this.getPageHeight(pageId);
                });
            } else {
                var lastPageId = this.data.pages[this.data.pages.length - 1].id;
                var lastPageList = this.data.pageMap[lastPageId];
                var index = this.data.limit - lastPageList.length;
                var pageId = list[index].id;
                if (lastPageList.length + list.length > this.data.limit) {
                    lastPageList = lastPageList.concat(list.slice(0, index));
                    this.data.pages.push(pageId);
                    this.setData({
                        paegs: this.data.pages,
                        [`pageMap[${pageId}]`]: list.slice(index)
                    }, () => {
                        this.getPageHeight(pageId);
                    });
                } else {
                    lastPageList = lastPageList.concat(list);
                }
                this.setData({
                    [`pageMap[${lastPageId}]`]: lastPageList
                }, () => {
                    this.getPageHeight(lastPageId);
                    this.scrollToBottom();
                });
            }
            if (!ifPre) {
                this.setData({
                    lastestId: list[list.length - 1].id,
                });
            }
            if (ifPre || !this.data.earlistId && list.length) {
                this.setData({
                    earlistId: list[0].id,
                    totalPage: data.page.totalPage
                });
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.request = null;
            setTimeout(() => {
                this.setData({
                    loading: false
                });
            }, 500);
            if (this.data.status == 1 && !this.pollStoped) { //聊天是否未关闭
                clearTimeout(this.pollTimer);
                this.pollTimer = setTimeout(() => {
                    this.getNewHistory();
                }, 3000);
            }
        });
        return this.request;
    },
    stopPoll() {
        this.pollStoped = true;
        clearTimeout(this.pollTimer);
        this.request && this.request.requestTask.abort();
    }
})