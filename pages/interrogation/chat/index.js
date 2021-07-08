import Utils from '../../../utils/util.js';

Page({
    data: {

    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'doctorInfo', 'userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.maxImgWidth = 550 / wx.jyApp.systemInfo.devicePixelRatio;
        if (wx.onKeyboardHeightChange) {
            wx.onKeyboardHeightChange((res) => {
                if (!this.data.inputFoucus) {
                    this.setData({
                        inputBottom: res.height
                    });
                }
            });
        }
        this.init(option);
    },
    onShow() {
        if (wx.jyApp.tempData.payInterrogationResult) {
            if (wx.jyApp.tempData.payInterrogationResult.result == 'success') {
                if (wx.jyApp.tempData.payInterrogationResult.type == 3) { //视频问诊
                    setTimeout(() => {
                        wx.jyApp.toast('支付成功');
                    }, 500);
                    wx.jyApp.utils.navigateTo({
                        url: '/pages/interrogation/apply-order-detail/index?type=interrogation&&id=' + wx.jyApp.tempData.payInterrogationResult.id
                    });
                }
                this.init({
                    id: wx.jyApp.tempData.payInterrogationResult.id
                });
                delete wx.jyApp.tempData.payInterrogationResult;
                return;
            } else {
                wx.jyApp.toast('支付失败');
                delete wx.jyApp.tempData.payInterrogationResult;
            }
        }
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
        this.storeBindings.destroyStoreBindings();
    },
    init(option) {
        this.setData({
            patient: {},
            currentUser: {},
            talker: {},
            consultOrder: {},
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
            screenVisible: false,
            screenList: [{
                name: 'NRS 2002',
                filtrateType: 'NRS 2002',
                selected: true
            }, {
                name: 'PG-SGA',
                filtrateType: 'PG-SGA'
            }, {
                name: 'SGA',
                filtrateType: 'SGA'
            }, {
                name: 'MUST',
                filtrateType: 'MUST'
            }, {
                name: 'MNA',
                filtrateType: 'MNA'
            }],
            filtrateType: 'NRS 2002'
        });
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
                if (wx.jyApp.tempData.toRecieve) {
                    var page = wx.jyApp.utils.getPages('pages/order-list/index');
                    if (page) { //已接诊
                        page.updateRecieve(option.id);
                    }
                }
                this.initRoom(data);
            }).finally(() => {
                delete wx.jyApp.tempData.toRecieve;
            });
        } else if (option.roomId) {
            return wx.jyApp.http({
                url: '/chat/room/info/' + option.roomId
            }).then((data) => {
                this.initRoom(data);
            });
        }
    },
    initRoom(data) {
        data.patient._sex = data.patient.sex == 1 ? '男' : '女';
        data.patient.BMI = (data.patient.weight) / (data.patient.height * data.patient.height / 10000);
        data.patient.BMI = data.patient.BMI && data.patient.BMI.toFixed(1) || '';
        this.setData({
            roomId: data.chatRoom.roomId,
            currentUser: data.currentUser,
            talker: data.talker,
            patient: data.patient,
            status: data.chatRoom.status,
            consultOrder: data.consultOrder,
            consultOrderId: data.chatRoom.consultOrderId
        });
        //转诊中或已转诊状态，医生底部的工具栏要隐藏掉
        if ((data.consultOrder.status == 8 || data.consultOrder.status == 9) && data.talker.role == 'DOCTOR') {
            this.setData({
                inputHeight: 0
            });
        }
        this.resetUnread().finally(() => {
            this.getNewHistory();
        });
        wx.setNavigationBarTitle({
            title: data.talker.nickname
        });
        wx.hideLoading();
    },
    onClickAvatar(e) {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/record/index?patientId=' + this.data.patient.id
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
    onGoto(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    //开指导
    onGuide(e) {
        this.data.patient.diseaseDetail = this.data.consultOrder.diseaseDetail;
        wx.jyApp.setTempData('guidePatient', this.data.patient);
        wx.jyApp.utils.navigateTo(e);
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
    //转诊
    onReferral() {
        wx.jyApp.dialog.confirm({
            message: '确定邀请营养师会诊？'
        }).then(() => {
            wx.jyApp.http({
                url: '/consultorder/transfer',
                method: 'post',
                data: {
                    id: this.data.consultOrderId
                }
            }).then(() => {
                this.setData({
                    'consultOrder.status': 8,
                    inputHeight: 0
                });
            });
        });
    },
    //发文字消息
    onSend() {
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
            if (this.data.doctorInfo) {
                chat.doctorId = this.data.doctorInfo.id;
                chat.userInfo = {
                    avatar: this.data.doctorInfo.avatar,
                    name: this.data.doctorInfo.doctorName
                }
            }
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
            sizeType: ['compressed'],
            success(res) {
                var uploadingChats = [];
                if (res.errMsg == 'chooseImage:ok') {
                    res.tempFilePaths.map((item) => {
                        var id = wx.jyApp.utils.getUUID();
                        var chat = {
                            id: id,
                            sender: self.data.currentUser.id,
                            type: 2,
                            txt: item,
                            sendStatus: 'uploading',
                            progress: 10,
                            sendTime: new Date().getTime(),
                            domId: 'id-' + id
                        };
                        if (self.data.doctorInfo) {
                            chat.doctorId = self.data.doctorInfo.id;
                            chat.userInfo = {
                                avatar: self.data.doctorInfo.avatar,
                                name: self.data.doctorInfo.doctorName
                            }
                        }
                        self.addLocalChat(chat);
                        uploadingChats.push(chat);
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
                [`pageMap[${chat.id}]`]: [chat]
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
            this.data.patient.diseaseDetail = this.data.consultOrder.diseaseDetail;
            wx.jyApp.setTempData('guidePatient', this.data.patient);
            wx.jyApp.utils.navigateTo({
                url: `/pages/interrogation/${this.data.consultOrder.type==2?'guidance-edit':'guidance-online/medical-record'}/index?id=${this.data.consultOrderId}&type=${this.data.consultOrder.type}`
            });
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
        wx.jyApp.showLoading('支付中...', true);
        wx.jyApp.http({
            url: '/apply/save',
            method: 'post',
            data: {
                id: this.data.consultOrderId
            }
        }).then((data) => {
            wx.hideLoading();
            this.setData({
                actionVisible: false
            });
            if (data.params) {
                wx.jyApp.utils.pay(data.params).then(() => {
                    wx.jyApp.toast('申请成功');
                    this.getNewHistory();
                }).catch(() => {
                    wx.jyApp.toast('支付失败');
                });
            } else {
                wx.jyApp.toast('申请成功');
                this.getNewHistory();
                this.data.consultOrder.applyCount = 1;
                this.setData({
                    'consultOrder.applyCount': 1
                });
            }
        }).catch(() => {
            wx.hideLoading();
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
            return wx.jyApp.Promise.resolve(this.data.pageHeightMap[pageId]);
        }
        return new wx.jyApp.Promise((resolve) => {
            var query = wx.createSelectorQuery()
            query.select('#page-id-' + pageId).boundingClientRect()
            query.exec(function (rect) {
                self.gettingPageHeight[pageId] = false;
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
                url: `${wx.jyApp.httpHost}/oss/upload?token=` + wx.getStorageSync('token'),
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
                        wx.jyApp.log.info('上传失败', res.data);
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
        var domId = this.data.pages[this.data.pages.length - 1];
        domId = this.data.pageMap[domId];
        domId = domId[domId.length - 1].id;
        domId = 'id-' + domId;
        this.setData({
            domId: domId
        })
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
        this.earlistId = this.data.earlistId;
        this.lastestId = this.data.lastestId;
        this.request && this.request.requestTask.abort();
        this.request = wx.jyApp.http({
            hideTip: this.data.pages.length > 0,
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
            //防止某些机型不支持abort而拉取重复记录的问题
            if (this.data.earlistId != this.earlistId || this.data.lastestId != this.lastestId) {
                return;
            }
            var list = data.page.list;
            if (!ifPre) {
                this.updateLastMessage(list);
            }
            list.reverse();
            if (list.length) {
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
            }
            //去除本地已发送的消息
            list = list.filter((item) => {
                return this.data.sendedIds.indexOf(item.id) == -1;
            });
            if (!list.length) {
                return;
            }
            list.map((item) => {
                item.domId = 'id-' + item.id; //id用来定位最新一条信息
                item.doctorId = this.data.consultOrder.acceptDoctorId || this.data.consultOrder.doctorId;
                if (item.type == 4 && item.orderApplyVO) {
                    item.orderApplyVO._status = wx.jyApp.constData.applyOrderStatusMap[item.orderApplyVO.status];
                    item.orderApplyVO.status = item.orderApplyVO.status;
                }
                if (item.type == 5 && item.nutritionOrderChatVO) {
                    item.nutritionOrderChatVO._status = wx.jyApp.constData.mallOrderStatusMap[item.nutritionOrderChatVO.status];
                }
                //已转诊医生的聊天记录
                if (item.sender && item.sender != this.data.currentUser.id && item.sender != this.data.talker.id) {
                    if (this.data.currentUser.role == 'DOCTOR') {
                        item.sender = this.data.currentUser.id;
                    } else {
                        item.sender = this.data.talker.id;
                    }
                    item.doctorId = this.data.consultOrder.doctorId;
                }
                if (item.sender && !item.userInfo) {
                    item.userInfo = {
                        avatar: item.sender == this.data.currentUser.id ? this.data.currentUser.avatarUrl : this.data.talker.avatarUrl
                    }
                }
            });
            list.map((item) => {
                if (item.type == 0 && item.associateId) { //系统消息动态更改申请单和指导单状态
                    var obj = null
                    try {
                        obj = JSON.parse(item.txt);
                        //状态消息需要从消息列表中删除
                        item.del = true;
                    } catch (e) {
                        obj = {};
                    }
                    //处理历史消息中的状态
                    this.chatListMapCall((_item) => {
                        _updateStatus(_item, item, obj);
                    });
                    //处理当前请求的消息中的状态
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
                        _item.orderApplyVO.status = obj.status;
                    }
                    if (obj.type == 5) {
                        _item.nutritionOrderChatVO = _item.nutritionOrderChatVO || {};
                        _item.nutritionOrderChatVO._status = wx.jyApp.constData.mallOrderStatusMap[obj.status];
                    }
                    if ([7, 8, 9, 10, 11].indexOf(obj.type) > -1) {
                        _item.filtrateChatVO = _item.orderApplyVO || {};
                        _item.filtrateChatVO.associateId = obj.associateId;
                        _item.filtrateChatVO.filtrateResult = obj.filtrateResult;
                    }
                }
            }
            //去除状态消息
            list = list.filter((item) => {
                return !item.del;
            });
            if (ifPre || !this.data.pages.length) { //上翻记录
                var pageId = list[0].id;
                this.data.pages.unshift(pageId);
                this.data.pageMap[pageId] = list;
                this.caculateSendTime();
                this.setData({
                    pages: this.data.pages,
                    [`pageMap[${pageId}]`]: list
                }, () => {
                    this.getPageHeight(pageId);
                });
                if (ifPre) {
                    this.setData({
                        domId: 'page-id-' + this.data.pages[1]
                    });
                } else {
                    this.scrollToBottom();
                }
            } else {
                var lastPageId = this.data.pages[this.data.pages.length - 1];
                var lastPageList = this.data.pageMap[lastPageId];
                if (lastPageList.length + list.length > this.data.limit) {
                    var index = this.data.limit - lastPageList.length;
                    var pageId = list[index].id;
                    lastPageList = lastPageList.concat(list.slice(0, index));
                    this.data.pages.push(pageId);
                    this.data.pageMap[pageId] = list.slice(index);
                    this.caculateSendTime();
                    this.setData({
                        pages: this.data.pages,
                        [`pageMap[${pageId}]`]: list.slice(index)
                    }, () => {
                        this.getPageHeight(pageId);
                    });
                    this.scrollToBottom();
                } else {
                    lastPageList = lastPageList.concat(list);
                    this.data.pageMap[lastPageId] = lastPageList;
                    this.caculateSendTime();
                    this.setData({
                        [`pageMap[${lastPageId}]`]: lastPageList
                    }, () => {
                        this.getPageHeight(lastPageId);
                    });
                    this.scrollToBottom();
                }
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
            if ( /* this.data.status == 1 && */ !this.pollStoped) { //聊天是否未关闭
                clearTimeout(this.pollTimer);
                this.pollTimer = setTimeout(() => {
                    this.getNewHistory();
                }, 3000);
            }
        });
        return this.request;
    },
    updateLastMessage(list) {
        var page = wx.jyApp.utils.getPages('pages/interrogation/message-list/index');
        if (page) { //已接诊
            for (var i = 0; i < list.length; i++) {
                if (list[i].type != 0) {
                    page.updateLastMessage(this.data.roomId, list[i].text, list[i].sendTime);
                    break;
                }
            }
        }
    },
    //计算发送时间的显示
    caculateSendTime() {
        var lastTime = new Date().getTime();
        var pages = this.data.pages.concat([]);
        var fifteen = 15 * 60 * 1000;
        var today = new Date();
        today = today - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000;
        pages.reverse();
        pages.map((item) => {
            var list = this.data.pageMap[item];
            list = list.concat([]);
            list.reverse();
            list.map((item) => {
                if (lastTime - item.sendTime > fifteen) {
                    if (item.sendTime > today) {
                        item.timeStr = new Date(item.sendTime).formatTime('hh:mm');
                    } else {
                        item.timeStr = new Date(item.sendTime).formatTime('yyyy-MM-dd hh:mm');
                    }
                    lastTime = item.sendTime;
                }
            });
        });
    },
    stopPoll() {
        this.pollStoped = true;
        clearTimeout(this.pollTimer);
        this.request && this.request.requestTask.abort();
    },
    //重置房间消息未读消息数
    resetUnread() {
        return wx.jyApp.http({
            url: '/chat/resetNotReadNum',
            method: 'post',
            data: {
                roomId: this.data.roomId
            }
        });
    },
    //问诊单详情
    onGotoInterrogationDetail(e) {
        var id = e.currentTarget.dataset.id
        wx.jyApp.http({
            url: '/consultorder/info/' + id
        }).then((data) => {
            wx.jyApp.tempData.applyOrderData = data;
            wx.jyApp.utils.navigateTo(e);
        });
    },
    //营养处方详情
    onGotoGuidanceDetail(e) {
        var id = e.currentTarget.dataset.id
        wx.jyApp.http({
            url: '/nutritionorder/info/' + id
        }).then((data) => {
            wx.jyApp.tempData.guidanceOrderData = data;
            wx.jyApp.utils.navigateTo(e);
        });
    },
    //视频通话
    onVideo(e) {
        var roomId = Math.ceil(Math.random() * 4294967295);
        wx.jyApp.room.invite({
            consultOrderId: this.data.consultOrderId,
            roomId: roomId,
            user: this.data.currentUser
        }).then(() => {
            wx.jyApp.utils.navigateTo({
                url: `/pages/trtc/index?consultOrderId=${this.data.consultOrderId}&roomId=${roomId}&nickname=${this.data.talker.nickname}&avatar=${this.data.talker.avatarUrl}`
            });
        });
    },
    //筛查
    onScreen() {
        this.setData({
            screenVisible: true
        });
    },
    //关闭筛查弹框
    onCloseScreen() {
        this.setData({
            screenVisible: false
        });
    },
    //选择筛查方式
    onClickSceen(e) {
        var item = e.currentTarget.dataset.item;
        this.data.screenList.map((_item) => {
            if (_item.filtrateType == item.filtrateType) {
                _item.selected = true;
            } else {
                _item.selected = false;
            }
        });
        this.setData({
            screenList: this.data.screenList,
            filtrateType: item.filtrateType
        });
    },
    //自己筛查
    onSelfScreen(e) {
        var url = '';
        switch (this.data.filtrateType) {
            case 'NRS 2002':
                url = '/pages/screen/nrs/index';
                break;
            case 'PG-SGA':
                url = '/pages/screen/pgsga/index';
                break;
            case 'SGA':
                url = '/pages/screen/sga/index';
                break;
            case 'MUST':
                url = '/pages/screen/must/index';
                break;
            case 'MNA':
                url = '/pages/screen/mna/index';
                break;
        }
        wx.jyApp.setTempData('screenPatient', this.data.patient);
        wx.jyApp.utils.navigateTo({
            url: `${url}?consultOrderId=${this.data.consultOrderId}&filtrateType=${this.data.filtrateType}&filtrateByName=${this.data.doctorInfo.doctorName}&doctorName=${this.data.doctorInfo.doctorName}`
        });
        this.setData({
            screenVisible: false
        });
    },
    //发送给患者筛查
    onSendScreen() {
        wx.jyApp.showLoading('发送中...', true);
        wx.jyApp.http({
            url: '/patient/filtrate/save',
            method: 'post',
            data: {
                consultOrderId: this.data.consultOrderId,
                filtrateType: this.data.filtrateType,
                isSelf: false,
            }
        }).then((data) => {
            this.setData({
                screenVisible: false
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    //聊天框点击筛查单
    onGotoScreen(e) {
        var url = e.currentTarget.dataset.url;
        wx.jyApp.setTempData('screenPatient', this.data.patient);
        if (this.data.currentUser.role == 'DOCTOR') {
            url = `${url}&filtrateByName=${this.data.doctorInfo.doctorName}&doctorName=${this.data.doctorInfo.doctorName}`
        } else {
            url = `${url}&filtrateByName=${this.data.patient.patientName}&doctorName=${this.data.doctorInfo.doctorName}`
        }
        wx.jyApp.utils.navigateTo({
            url: url
        });
    },
    //供其他页面更新评论状态为已评论
    updateAppraise(id) {
        if (this.data.consultOrderId == id) {
            this.data.consultOrder.isAppraise = true;
            this.setData({
                consultOrder: this.data.consultOrder
            });
        }
    }
})