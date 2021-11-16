Page({
    data: {
        tipVisible: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'doctorInfo', 'userInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.maxImgWidth = 550 / wx.jyApp.systemInfo.devicePixelRatio;
        this.firstLoad = true;
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
            roomId: '',
            consultOrderId: '',
            earlistId: '',
            lastestId: '',
            sendedIds: [],
            totalPage: 0,
            applyOrderMap: {},
            status: 0, //1:聊天未关闭，0:聊天已关闭
            limit: 20,
            pages: [0],
            pageMap: {
                0: []
            },
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
            }, {
                name: '肿瘤恶液质评估',
                filtrateType: 'TUNOUR_FLUID'
            }, {
                name: '口腔黏膜风险评估',
                filtrateType: 'ORAL_MUCOSA'
            }, {
                name: '放射性损伤评估',
                filtrateType: 'X_INJURY'
            }, {
                name: '超重与肥胖筛查',
                filtrateType: 'FAT'
            }, {
                name: '超重与肥胖评估',
                filtrateType: 'FAT-ASSESS'
            }],
            fatScreenList: [{
                name: '出生、喂养史、发育史',
                filtrateType: 'FAT-GROW'
            }, {
                name: '家族史',
                filtrateType: 'FAT-HOME'
            }, {
                name: '疾病史',
                filtrateType: 'FAT-DISEASE'
            }, {
                name: '肥胖治疗史',
                filtrateType: 'FAT-TREAT'
            }, {
                name: '膳食调查',
                filtrateType: 'FAT-DIET'
            }, {
                name: '久坐行为调查',
                filtrateType: 'FAT-SIT'
            }, {
                name: '睡眠评估',
                filtrateType: 'FAT-SLEEP'
            }, {
                name: '活动水平评估',
                filtrateType: 'FAT-ACTION'
            }, {
                name: '体脂肪含量测量',
                filtrateType: 'FAT-BODY'
            }],
            filtrateType: 'NRS 2002'
        });
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.initV2(option);
    },
    initV2(option) {
        var data = {};
        if (option.groupFlag == 1 || option.departmentId) {
            this.roomType = 'group-chat';
        } else {
            this.roomType = 'single-chat';
        }
        if (option.roomId) {
            data.roomId = option.roomId;
        }
        if (option.doctorId) {
            data.doctorId = option.doctorId;
        }
        if (option.departmentId) {
            data.departmentId = option.departmentId;
        }
        if (option.patientId) {
            data.patientId = option.patientId;
        }
        this.setData({
            roomType: this.roomType
        });
        return wx.jyApp.http({
            url: '/chat/v2/init',
            method: 'get',
            data: data
        }).then((data) => {
            this.initRoom(data);
        });
    },
    initRoom(data) {
        if (data.patient) {
            data.patient._sex = data.patient.sex == 1 ? '男' : '女';
            data.patient.BMI = (data.patient.weight) / (data.patient.height * data.patient.height / 10000);
            data.patient.BMI = data.patient.BMI && data.patient.BMI.toFixed(1) || '';
        }
        this.setData({
            roomId: data.roomInfo.roomId,
            currentUser: data.currentUser,
            talker: data.talker,
            patient: data.patient,
            roomInfo: data.roomInfo,
        });
        this.resetUnread().finally(() => {
            this.getNewHistory();
        });
        if (data.talker) {
            wx.setNavigationBarTitle({
                title: data.talker.nickname
            });
        } else {
            wx.setNavigationBarTitle({
                title: data.roomInfo.departmentName
            });
        }
        wx.hideLoading();
    },
    onClickAvatar(e) {
        var id = e.currentTarget.dataset.id;
        if (this.data.userInfo.role == 'DOCTOR' || this.data.patient.id == id) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/record/index?patientId=' + this.data.patient.id
            });
        }
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
    //发文字消息
    onSend() {
        this.getNewHistory().then(() => {
            var inputValue = this.data.inputValue;
            var id = 'msg-' + wx.jyApp.utils.getUUID();
            var chat = {
                id: id,
                sendStatus: 'sending',
                type: 1,
                txt: inputValue,
                sendTime: new Date().getTime(),
                domId: id,
                isSelf: true,
                userInfo: {
                    id: this.data.currentUser.id,
                    avatar: this.data.currentUser.avatar,
                    name: this.data.currentUser.nickname
                }
            };
            if (this.data.doctorInfo) {
                chat.userInfo.doctorId = this.data.doctorInfo.id;
                chat.userInfo.avatar = this.data.doctorInfo.avatar;
                chat.userInfo.name = this.data.doctorInfo.doctorName;
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
                        var id = 'msg-' + wx.jyApp.utils.getUUID();
                        var chat = {
                            id: id,
                            type: 2,
                            txt: item,
                            sendStatus: 'uploading',
                            progress: 10,
                            sendTime: new Date().getTime(),
                            domId: id,
                            isSelf: true,
                            userInfo: {
                                id: self.data.currentUser.id,
                                avatar: self.data.currentUser.avatar,
                                name: self.data.currentUser.nickname
                            }
                        };
                        if (self.data.doctorInfo) {
                            chat.userInfo.doctorId = self.data.doctorInfo.id;
                            chat.userInfo.avatar = self.data.doctorInfo.avatar;
                            chat.userInfo.name = self.data.doctorInfo.doctorName;
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
                [`pageMap.${chat.id}`]: [chat]
            }, () => {
                this.scrollToBottom();
            });
        } else {
            lastPageList.push(chat);
            this.setData({
                [`pageMap.${lastPageId}`]: lastPageList
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
    //点击开指导按钮
    onClickApply() {
        wx.jyApp.setTempData('guidePatient', this.data.patient);
        wx.jyApp.utils.navigateTo({
            url: `/pages/interrogation/guidance-online/medical-record/index?patientId=${this.data.patient.id}`
        });
        this.setData({
            panelVisible: false
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
                    [`pageMap.${pageId}[${index}]`]: item
                }, () => {
                    if (item.height != 120) {
                        this.setData({
                            [`pageHeightMap.${pageId}`]: 0
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
                    [`pageMap.${pageId}[${index}]`]: item
                }, () => {
                    if (item.height != 120) {
                        this.setData({
                            [`pageHeightMap.${pageId}`]: 0
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
                    [`pageMap.${pageId}[${index}]`]: item
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
                            [`pageHeightMap.${pageId}`]: rect[0].height
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
                            [`pageMap.${pageId}[${index}]`]: item
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
            url: '/chat/history/v2/send',
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
        domId = domId[domId.length - 1].domId;
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
            url: '/chat/history/v2/poll',
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
                // 首次进入弹出顶部提示
                if (this.firstLoad && this.data.userInfo.role == 'USER') {
                    this.setData({
                        tipVisible: true
                    });
                    setTimeout(() => {
                        this.setData({
                            tipVisible: false
                        });
                    }, 10 * 1000);
                }
                this.firstLoad = false;
                return;
            }
            this.firstLoad = false;
            list.map((item) => {
                item.id = 'msg-' + item.id;
                item.domId = item.id; //id用来定位最新一条信息
                if (item.userInfo) {
                    item.isSelf = item.userInfo.id == this.data.currentUser.id && item.role == this.data.userInfo.role;
                }
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
                    if (obj.type == 5) {
                        _item.nutritionOrderChatVO = _item.nutritionOrderChatVO || {};
                        _item.nutritionOrderChatVO._status = wx.jyApp.constData.mallOrderStatusMap[obj.status];
                    }
                    if ([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].indexOf(obj.type) > -1) {
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
            if (ifPre) { //上翻记录或首次加载
                var pageId = list[0].id;
                this.data.pages.unshift(pageId);
                this.data.pageMap[pageId] = list;
                this.caculateSendTime();
                this.setData({
                    pages: this.data.pages,
                    [`pageMap.${pageId}`]: list
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
                        [`pageMap.${pageId}`]: list.slice(index)
                    }, () => {
                        this.getPageHeight(pageId);
                    });
                    this.scrollToBottom();
                } else {
                    lastPageList = lastPageList.concat(list);
                    this.data.pageMap[lastPageId] = lastPageList;
                    this.caculateSendTime();
                    this.setData({
                        [`pageMap.${lastPageId}`]: lastPageList
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
            if (!this.pollStoped) { //聊天是否未关闭
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
        if (page) { //修改消息列表中的最新文案
            for (var i = 0; i < list.length; i++) {
                if (list[i].type != 0) {
                    page.updateLastMessage(this.data.roomId, list[i].txt, list[i].sendTime);
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
        if (item.filtrateType == 'FAT-ASSESS') {
            this.setData({
                fatScreenVisible: true
            });
            item.filtrateType = 'FAT-GROW';
        } else if (item.filtrateType.indexOf('FAT-') == -1) {
            this.setData({
                fatScreenVisible: false
            });
        }
        this.data.screenList.map((_item) => {
            if (_item.filtrateType == item.filtrateType) {
                _item.selected = true;
            } else {
                _item.selected = false;
            }
        });
        this.data.fatScreenList.map((_item) => {
            if (_item.filtrateType == item.filtrateType) {
                _item.selected = true;
            } else {
                _item.selected = false;
            }
        });
        this.setData({
            screenList: this.data.screenList,
            fatScreenList: this.data.fatScreenList,
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
            case 'TUNOUR_FLUID':
                url = '/pages/screen/tumour-fluid/index';
                break;
            case 'ORAL_MUCOSA':
                url = '/pages/screen/oral-mucosa/index';
                break;
            case 'X_INJURY':
                url = '/pages/screen/radiation-injury/index';
                break;
            case 'FAT':
                url = '/pages/screen/fat/index';
                break;
            case 'FAT-GROW':
                url = '/pages/screen/birth-history/index';
                break;
            case 'FAT-HOME':
                url = '/pages/screen/family-history/index';
                break;
            case 'FAT-DISEASE':
                url = '/pages/screen/disease-history/index';
                break;
            case 'FAT-TREAT':
                url = '/pages/screen/fat-history/index';
                break;
            case 'FAT-DIET':
                url = '/pages/screen/food-investigate/index';
                break;
            case 'FAT-SIT':
                url = '/pages/screen/sit-investigate/index';
                break;
            case 'FAT-SLEEP':
                url = '/pages/screen/sleep-assess/index';
                break;
            case 'FAT-ACTION':
                url = '/pages/screen/act-assess/index';
                break;
            case 'FAT-BODY':
                url = '/pages/screen/body-fat/index';
                break;
        }
        if (this.data.filtrateType.indexOf('FAT-') > -1 && !(this.data.patient.age >= 6 && this.data.patient.age <= 18)) {
            wx.jyApp.toast('该项筛查/评估适用年龄为6-18岁');
            return;
        }
        wx.jyApp.setTempData('screenPatient', this.data.patient);
        wx.jyApp.utils.navigateTo({
            url: `${url}?patientId=${this.data.patient.id}&filtrateType=${this.data.filtrateType}&filtrateByName=${this.data.doctorInfo.doctorName}&doctorName=${this.data.doctorInfo.doctorName}&roomId=${this.data.roomId}`
        });
        this.setData({
            screenVisible: false
        });
    },
    //发送给患者筛查
    onSendScreen() {
        wx.jyApp.showLoading('发送中...', true);
        wx.jyApp.http({
            url: '/patient/filtrate/save/v2',
            method: 'post',
            data: {
                patientId: this.data.patient.id,
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
        var item = e.currentTarget.dataset.item;
        wx.jyApp.setTempData('screenPatient', this.data.patient);
        if (this.data.currentUser.role == 'DOCTOR') {
            url = `${url}&filtrateByName=${this.data.doctorInfo.doctorName}&doctorName=${this.data.doctorInfo.doctorName}&roomId=${this.data.roomId}`
            wx.jyApp.utils.navigateTo({
                url: url
            });
        } else {
            wx.jyApp.loginUtil.getDoctorInfo(item.userInfo.doctorId).then((data) => {
                url = `${url}&filtrateByName=${this.data.patient.patientName}&doctorName=${data.doctor.doctorName}&roomId=${this.data.roomId}`
                wx.jyApp.utils.navigateTo({
                    url: url
                });
            });
        }
    },
})