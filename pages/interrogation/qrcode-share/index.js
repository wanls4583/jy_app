Page({
    data: {
        barcode: '',
        type: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.doctorId = option.doctorId;
        this.userId = option.userId;
        this.type = option.type;
        this.getQrCode();
        this.setData({
            type: this.type
        });
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
                data: this.data.configData.h5_code_share_url + '?url=' + encodeURIComponent(this.data.barcode),
                success(res) {
                    wx.showToast({
                        title: '复制成功'
                    });
                }
            });
        });
    },
    //保存二维码
    onSave() {
        this.downloadImg().then((url) => {
            this.saveImageToPhotos(url);
        });
    },
    //下载图片
    downloadImg() {
        return new wx.jyApp.Promise((resolve, reject) => {
            wx.downloadFile({
                url: this.data.barcode,
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
                    wx.showToast({ title: '保存成功' })
                },
                fail: (err) => {
                    console.log(err)
                    wx.jyApp.toast('保存失败');
                }
            })
        }
    },
    getQrCode() {
        wx.jyApp.http({
            url: '/wx/share/barcode',
            data: {
                page: '/page/index/index',
                scene: `type=${this.type}&doctorId=${this.doctorId||''}&userId=${this.userId||''}`
            }
        }).then((data) => {
            this.setData({
                barcode: data.barcode
            });
        });
    }
})