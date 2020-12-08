/*
 * @Author: lisong
 * @Date: 2020-12-07 14:13:14
 * @Description: 
 */
Page({
    data: {
        trtcConfig: null,
        active: false,
        roomId: '',
        nickname: '',
        avatar: ''
    },
    onLoad(option) {
        this.getUserSig().then(() => {
            this.setData({
                active: option.active || false,
                roomId: option.roomId || '',
                nickname: option.nickname || '',
                avatar: option.avatar || '',
            });
            if (this.data.active) {
                this.initRoom();
            }
        });
        wx.setKeepScreenOn({
            keepScreenOn: true,
        });
    },
    onUnload() {
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
            if (trtcRoomContext) {
                trtcRoomContext.on(EVENT.LOCAL_JOIN, (event) => {
                    // 进房成功后发布本地音频流和视频流 
                    trtcRoomContext.publishLocalVideo()
                    trtcRoomContext.publishLocalAudio()
                })
                // 监听远端用户的视频流的变更事件
                trtcRoomContext.on(EVENT.REMOTE_VIDEO_ADD, (event) => {
                    if (!this.remoteUser || this.remoteUser === data.userID) {
                        // 订阅（即播放）远端用户的视频流
                        let userID = event.data.userID
                        let streamType = event.data.streamType// 'main' or 'aux'            
                        trtcRoomContext.subscribeRemoteVideo({ userID: userID, streamType: streamType })
                        this.remoteUser = userID;
                    }
                })

                // 监听远端用户的音频流的变更事件
                trtcRoomContext.on(EVENT.REMOTE_AUDIO_ADD, (event) => {
                    // 订阅（即播放）远端用户的音频流
                    if (!this.remoteUser || this.remoteUser === data.userID) {
                        let userID = event.data.userID
                        trtcRoomContext.subscribeRemoteAudio({ userID: userID })
                        this.remoteUser = userID;
                    }
                })
                // 远端用户退出
                trtcRoomContext.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
                    if (this.remoteUser === event.data.userID) {
                        this.remoteUser = null;
                        wx.jyApp.toast('通话结束');
                        setTimeout(() => {
                            trtcRoomContext._hangUp();
                        }, 1500);
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
        wx.jyApp.toast('已取消');
        setTimeout(() => {
            wx.navigateBack();
        }, 1500);
    }
})