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
        if (this.remoteUser) {
            setTimeout(() => {
                wx.jyApp.toast('通话已结束');
            }, 500);
        }
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
        this.setData({
            trtcConfig: {
                sdkAppID: '1400456678',  // 开通实时音视频服务创建应用后分配的 SDKAppID
                userID: this.userID,     // 用户 ID，可以由您的帐号系统指定
                userSig: this.userSig,   // 身份签名，相当于登录密码的作用
                template: '1v1',         // 画面排版模式
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
                })
                trtcRoomContext.on(EVENT.LOCAL_LEAVE, (event) => {
                    wx.navigateBack();
                    if (!this.remoteUser) {
                        setTimeout(() => {
                            wx.jyApp.toast('通话已取消');
                        }, 500);
                    }
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
                    }
                })
                // 远端用户退出
                trtcRoomContext.on(EVENT.REMOTE_USER_LEAVE, (event) => {
                    if (this.remoteUser === event.data.userID) {
                        trtcRoomContext.exitRoom();
                        wx.navigateBack();
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
                    this.trtcRoomContext && this.trtcRoomContext.exitRoom();
                    wx.navigateBack();
                    setTimeout(() => {
                        wx.jyApp.toast('对方已拒绝通话');
                    }, 500);
                    break;
                case 'CANCEL':
                    this.trtcRoomContext && this.trtcRoomContext.exitRoom();
                    wx.navigateBack();
                    setTimeout(() => {
                        wx.jyApp.toast('对方已取消通话');
                    }, 500);
                    break;
                case 'CALL':
                    wx.jyApp.room.setRoomInfo({ type: 'BUSY', roomId: data.roomId, consultOrderId: data.consultOrderId });
                    break;
                case 'BUSY':
                    wx.jyApp.toast('对方忙线中');
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
        });
    },
    onAnser() {
        this.initRoom();
    },
    onHandup() {
        wx.jyApp.room.refuse({ roomId: this.data.roomId, consultOrderId: this.data.consultOrderId });
        wx.navigateBack();
        setTimeout(() => {
            wx.jyApp.toast('通话已取消');
        }, 500);
    }
})