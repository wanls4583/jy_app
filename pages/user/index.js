Page({
    data: {
        avatar: {},
        progressMap: {},
        sexVisible: false,
        nickname: '',
        address: '',
        starPhone: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo'],
            actions: ['updateUserInfo'],
        });
        wx.nextTick(() => {
            var id = wx.jyApp.utils.getUUID();
            this.setData({
                sexList: ['女', '男'],
                nickname: this.data.userInfo.nickname,
                sex: this.data.userInfo.sex == 1 ? '男' : '女',
                avatar: {
                    path: this.data.userInfo.avatarUrl,
                    id: id
                }
            })
            this.taskMap = {};
            this.pciMap = {};
            if (this.data.userInfo.phone) {
                this.setData({
                    starPhone: this.data.userInfo.phone.slice(0, 3) + '****' + this.data.userInfo.phone.slice(-4)
                });
            }
        });
    },
    onGotao(e) {
        wx.jyApp.utils.navigateTo(e);
    },
    onShow() {
        this.getDefaultAdderss();
    },
    onShowNickname() {
        wx.jyApp.utils.setText({
            title: '设置昵称',
            defaultValue: this.data.nickname,
            complete: (value) => {
                this.setData({
                    nickname: value
                });
                this.data.userInfo.nickname = this.data.nickname;
                this.updateUserInfo(Object.assign({}, this.data.userInfo));
                this._updateUserInfo();
            }
        });
    },
    onShowSex() {
        this.setData({
            sexVisible: true
        });
    },
    onShowAddress() {
        wx.navigateTo({
            url: '/pages/mall/address-list/index'
        });
    },
    onConfirmSex(e) {
        this.setData({
            sex: e.detail.value,
            sexVisible: false
        });
        this.data.userInfo.sex = e.detail.index;
        this.updateUserInfo(Object.assign({}, this.data.userInfo));
        this._updateUserInfo();
    },
    onCancelSex() {
        this.setData({
            sexVisible: false
        });
        this.selectComponent('#sex').setIndexes([this.data.userInfo.sex]);
    },
    chooseAvater() {
        var self = this;
        wx.chooseImage({
            count: 1,
            success(res) {
                var files = [];
                res.tempFiles.map((item) => {
                    if (item.size < 1024 * 1024 * 3) {
                        files.push({
                            path: item.path,
                            id: wx.jyApp.utils.getUUID()
                        });
                    } else {
                        wx.jyApp.toast('文件大于3M，已取消');
                    }
                });
                if (files) {
                    if (self.taskMap[self.data.avatar.id]) { //删除正在上传的头像
                        self.taskMap[self.data.avatar.id].abort();
                        delete self.taskMap[self.data.avatar.id];
                    }
                    self.setData({
                        avatar: files[0]
                    });
                    self.uploadImages(files, self.avatar);
                }
            }
        });
    },
    uploadImages(files, picUrls) {
        var self = this;
        self.taskMap = self.taskMap || {};
        files.map((item) => {
            self.taskMap[item.id] = wx.uploadFile({
                url: 'https://dev.juyuanyingyang.com/ihospital/app/api/oss/upload?token=' + wx.getStorageSync('token'),
                filePath: item.path,
                name: 'file',
                header: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                success(res) {
                    var data = JSON.parse(res.data);
                    delete self.taskMap[item.id];
                    if (data.url) {
                        self.data.avatarUrl = data.url;
                        self.updateUserInfo(Object.assign({}, this.data.userInfo));
                        self._updateUserInfo();
                        self.data.progressMap[item.id] = 101;
                    } else {
                        self.data.progressMap[item.id] = -1
                    }
                    self.setData({
                        progressMap: self.data.progressMap
                    });
                }
            });
            self.taskMap[item.id].onProgressUpdate((data) => {
                if (data.progress == 100) {
                    data.progress = 99;
                }
                self.data.progressMap[item.id] = data.progress;
                self.setData({
                    progressMap: self.data.progressMap
                });
            });
        });
    },
    getPhoneNumber(e) {
        if (e.detail.iv && e.detail.encryptedData) {
            wx.showLoading({
                title: '获取中...',
                mask: true
            });
            wx.jyApp.http({
                url: '/wx/user/authorize/phone',
                method: 'post',
                data: {
                    iv: e.detail.iv,
                    encryptedData: e.detail.encryptedData
                }
            }).then((data) => {
                this.data.userInfo.phone = data.phone;
                this.updateUserInfo(Object.assign({}, this.data.userInfo));
            }).finally(() => {
                wx.hideLoading();
                wx.navigateTo({
                    url: '/pages/phone-bind/index'
                });
            });
        } else {
            wx.navigateTo({
                url: '/pages/phone-bind/index'
            });
        }
    },
    getDefaultAdderss() {
        wx.jyApp.http({
            url: '/user/address/list'
        }).then((data) => {
            var arr = data.list.filter((item) => {
                return item.isDefault == 1;
            });
            arr.length && this.setData({
                address: arr[0].provinceCity + arr[0].address
            });
        });
    },
    _updateUserInfo() {
        wx.showLoading({
            title: '更新中...',
            mask: true
        });
        wx.jyApp.loginUtil.updateUserInfo(this.data.userInfo).then(() => {
            wx.jyApp.toast('更新成功');
        }).finally(() => {
            wx.hideLoading();
        });
    }
})