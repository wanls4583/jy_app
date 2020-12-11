/*
 * @Author: lisong
 * @Date: 2020-12-07 14:13:14
 * @Description: 
 */
Page({
    data: {
        trtcConfig: null,
        recieve: false, //是否未接听者
        userId: '',
        roomId: '',
        consultOrderId: '',
        nickname: '',
        avatar: '',
        waiting: false
    },
    onLoad(option) {
        this.setData({
            recieve: option.recieve || false,
            waiting: !option.recieve,
            roomId: option.roomId || '',
            consultOrderId: option.consultOrderId || '',
            nickname: option.nickname || '',
            avatar: option.avatar || '',
        });
        this.getUserSig().then(() => {
            if (!this.data.recieve) {
                this.initRoom();
            }
        });
        this.initEvent();
        wx.setKeepScreenOn({
            keepScreenOn: true,
        });
    },
    onUnload() {
        this.trtcRoomContext && this.trtcRoomContext.exitRoom();
        delete wx.jyApp.tempData.roomInfoCallBack;
        wx.setKeepScreenOn({
            keepScreenOn: false,
        });
    },
    onShow: function () {
        wx.setKeepScreenOn({
            keepScreenOn: true,
        });
    },
    initRoom() {
        var streamID = this.userID + '_' + this.data.roomId + '_' + String(Math.random()).slice(2);
        this.setData({
            trtcConfig: {
                sdkAppID: '1400456678',  // 开通实时音视频服务创建应用后分配的 SDKAppID
                userID: this.userID,     // 用户 ID，可以由您的帐号系统指定
                userSig: this.userSig,   // 身份签名，相当于登录密码的作用
                template: '1v1',         // 画面排版模式
                streamID: streamID
            }
        }, () => {
            let trtcRoomContext = this.selectComponent('#trtcroom')
            let EVENT = trtcRoomContext.EVENT
            this.trtcRoomContext = trtcRoomContext;
            if (trtcRoomContext) {
                trtcRoomContext.on(EVENT.LOCAL_JOIN, (event) => {
                    // 进房成功后发布本地音频流和视频流 
                    trtcRoomContext.publishLocalVideo()
                    trtcRoomContext.publishLocalAudio()
                    //最长等待50秒
                    this.timeoutTimer = setTimeout(() => {
                        this.timeoutTimer = null;
                        trtcRoomContext.exitRoom();
                        wx.jyApp.toast('当前无人接听，请稍后再试');
                        wx.jyApp.room.cancel({ roomId: this.data.roomId, consultOrderId: this.data.consultOrderId });
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                    }, 50000);
                })
                trtcRoomContext.on(EVENT.LOCAL_LEAVE, (event) => {
                    this.trtcRoomContext = null;
                    if (!this.remoteUser) {
                        if (this.timeoutTimer) {
                            wx.jyApp.toast('通话已取消');
                            wx.jyApp.room.cancel({ roomId: this.data.roomId, consultOrderId: this.data.consultOrderId });
                        }
                    } else {
                        wx.jyApp.room.over({ roomId: this.data.roomId, consultOrderId: this.data.consultOrderId });
                        wx.jyApp.toast('通话已结束');
                    }
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 1500);
                })
                // 监听远端用户的视频流的变更事件
                trtcRoomContext.on(EVENT.REMOTE_VIDEO_ADD, (event) => {
                    let userID = event.data.userID
                    if (!this.remoteUser || this.remoteUser === userID) {
                        // 订阅（即播放）远端用户的视频流
                        let streamType = event.data.streamType// 'main' or 'aux'            
                        trtcRoomContext.subscribeRemoteVideo({ userID: userID, streamType: streamType })
                        this.remoteUser = userID;
                        this.setData({
                            waiting: false
                        })
                        this.timeoutTimer && clearTimeout(this.timeoutTimer);
                    }
                })

                // 监听远端用户的音频流的变更事件
                trtcRoomContext.on(EVENT.REMOTE_AUDIO_ADD, (event) => {
                    let userID = event.data.userID
                    // 订阅（即播放）远端用户的音频流
                    if (!this.remoteUser || this.remoteUser === userID) {
                        trtcRoomContext.subscribeRemoteAudio({ userID: userID })
                        this.remoteUser = userID;
                        this.setData({
                            waiting: false
                        })
                        this.timeoutTimer && clearTimeout(this.timeoutTimer);
                    }
                })
                // 远端用户退出
                trtcRoomContext.on(EVENT.REMOTE_USER_LEAVE, (event) => {
                    if (this.remoteUser === event.data.userID) {
                        wx.jyApp.toast('通话已结束');
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                        this.timeoutTimer && clearTimeout(this.timeoutTimer);
                    }
                })
                // 进入房间
                trtcRoomContext.enterRoom({ roomID: this.data.roomId }).catch((res) => {
                    wx.jyApp.toast('进房失败');
                    console.error('room joinRoom 进房失败:', res)
                })
            }
        })
    },
    initEvent() {
        wx.jyApp.tempData.roomInfoCallBack = (data) => {
            switch (data.type) {
                case 'REJECT':
                    if (data.roomId == this.data.roomId) {
                        wx.jyApp.toast('对方已拒绝通话');
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                    }
                    break;
                case 'CANCEL':
                    if (data.roomId == this.data.roomId) {
                        wx.jyApp.toast('对方已取消通话');
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                    }
                    break;
                case 'CALL':
                    wx.jyApp.room.busy({ roomId: data.roomId, consultOrderId: data.consultOrderId });
                    break;
                case 'BUSY':
                    wx.jyApp.toast('对方忙线中，请稍后再试');
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 1500);
                    break;
            }
        }
    },
    getUserSig() {
        return wx.jyApp.http({
            url: '/wx/trtc/sig'
        }).then((data) => {
            this.userSig = data.userSig;
            this.userID = data.userId;
        }).catch(() => {
            wx.navigateBack();
        });
    },
    onAnser() {
        this.initRoom();
    },
    onHandup() {
        wx.jyApp.room.refuse({ roomId: this.data.roomId, consultOrderId: this.data.consultOrderId });
        wx.jyApp.toast('通话已取消');
        setTimeout(() => {
            wx.navigateBack();
        }, 1500);
    }
})