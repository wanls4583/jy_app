Page({
    data: {
        barcodeUrl: '',
        type: '',
        from: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.uId = this.data.userInfo && this.data.userInfo.id || '';
        this.dId = this.data.doctorInfo && this.data.doctorInfo.id || '';
        this.dName = this.data.doctorInfo && this.data.doctorInfo.doctorName || '';
        this.stype = option.stype; //要调转的具体筛查方式
        this.setData({
            from: option.from
        });
        if (option.barcodeUrl) {
            this.setData({
                barcodeUrl: option.barcodeUrl
            })
        } else if (option.from == 'screen') { //调转到筛查页面
            this.getQrCode(2);
        } else if (option.from == 'invite') {
            this.getQrCode(3);
        } else {
            wx.jyApp.toast('参数错误');
        }
        if (option.from == 'screen') {
            wx.setNavigationBarTitle({
                title: '筛查二维码'
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    //分享
    onShare() {
        wx.jyApp.dialog.confirm({
            message: 'H5分享链接生成成功',
            confirmButtonText: '复制链接'
        }).then(() => {
            wx.setClipboardData({
                data: this.data.configData.h5_code_share_url + '?url=' + encodeURIComponent(this.data.barcodeUrl),
                success(res) {
                    wx.showToast({
                        title: '复制成功'
                    });
                }
            });
        });
    },
    onShareAppMessage: function () {
        var path = '/pages/index/index?type=2&dId=' + this.dId;
        if (this.data.from == 'screen') {
            var url = `/pages/screen/screen-select/index?doctorId=${this.dId}&doctorName=${this.dName}`;
            url = encodeURIComponent(url);
            path = '/pages/index/index?type=-1&url=' + url;
        }
        return {
            title: this.dName || '医生',
            path: path,
            imageUrl: this.data.doctorInfo.avatar || '/image/logo.png'
        }
    },
    //保存二维码
    onSave() {
        this.downloadImg().then((url) => {
            this.saveImageToPhotos(url);
        });
    },
    // 领取二维码
    onReceive() {
        wx.jyApp.utils.navigateTo({
            url: '/pages/interrogation/receive-select/index'
        });
    },
    //下载图片
    downloadImg() {
        return new wx.jyApp.Promise((resolve, reject) => {
            wx.downloadFile({
                url: this.data.barcodeUrl,
                success: (res) => {
                    if (res.statusCode == 200 && res.tempFilePath) {
                        resolve(res.tempFilePath);
                    } else {
                        wx.jyApp.toast(`图片下载失败,code:${res.statusCode}`);
                        reject();
                    }
                },
                fail: () => {
                    wx.jyApp.toast('图片下载失败');
                    reject();
                }
            })
        });
    },
    // 点击保存图片到相册(授权)
    saveImageToPhotos(filePath) {
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _saveImage(filePath)
                        },
                        fail() {
                            wx.jyApp.dialog.confirm({
                                message: '保存图片需要获取相册权限，请先授权后再保存',
                                confirmButtonText: '授权',
                                confirmButtonOpenType: 'openSetting'
                            });
                        }
                    })
                } else {
                    _saveImage(filePath)
                }
            },
            fail(res) {
                console.log(res);
            }
        });

        function _saveImage(filePath) {
            wx.saveImageToPhotosAlbum({
                filePath: filePath, // 此为图片路径
                success: (res) => {
                    console.log(res)
                    wx.showToast({
                        title: '保存成功'
                    })
                },
                fail: (err) => {
                    console.log(err)
                    wx.jyApp.toast('保存失败');
                }
            })
        }
    },
    getQrCode(type) {
        wx.jyApp.http({
            url: '/wx/share/barcode',
            data: {
                page: 'pages/index/index',
                scene: `type=${type},dId=${this.dId},uId=${this.uId}${type==2&&this.stype?',stype='+this.stype:''}`
            }
        }).then((data) => {
            this.setData({
                barcodeUrl: data.barcode
            });
        });
    }
})