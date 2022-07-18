Page({
    data: {
        barcodeUrl: '',
        type: '',
        from: '',
        active: 0,
        isTeam: false
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
        this.jobTitle = this.data.doctorInfo && this.data.doctorInfo.jobTitle || '';
        this.dpId = this.data.doctorInfo && this.data.doctorInfo.hosDepartment && this.data.doctorInfo.hosDepartment.departmentId || '';
        this.stype = option.stype; //要调转的具体筛查方式
        this.type = option.type || '';
        this.qrMap = {};
        this.setData({
            from: option.from
        });
        if (option.barcodeUrl) {
            this.setData({
                barcodeUrl: option.barcodeUrl
            });
        } else if (option.from == 'home') { //首页二维码
            this.type = 6;
            this.getQrCode();
            this.setData({
                isTeam: true
            });
        } else if (option.from == 'team') { //团队二维码
            this.type = 5;
            this.setData({
                barcodeUrl: this.data.doctorInfo.hosDepartment.doctorBarcodeUrl
            })
        } else if (option.from == 'screen') { //筛查二维码
            this.type = 2;
            this.getQrCode();
        } else if (option.from == 'invite') { //邀请医生二维码
            this.type = 3;
            this.getQrCode();
        } else if (option.from == 'product') { //
            this.type = 8;
            this.pId = option.pId;
            this.getQrCode();
        } else if (this.type) {
            this.getQrCode();
        } else {
            wx.jyApp.toast('参数错误');
        }
        if (option.from == 'screen') {
            wx.setNavigationBarTitle({
                title: '筛查二维码'
            });
        } else if (option.from == 'team') {
            wx.setNavigationBarTitle({
                title: '邀请团队成员'
            });
        }
        var tip = '';
        var title = '';
        if (option.tip) {
            tip = option.tip;
        } else if (this.data.isTeam) {
            tip = '将二维码展示给患者，扫码后可加入我的科室';
            title = '邀请患者加入科室';
        } else if (option.from == 'team') {
            tip = '将二维码展示给医生，扫码后可加入我的团队';
            title = '邀请科室医生加入团队';
        } else if (option.from == 'screen') {
            tip = '将二维码展示给患者，扫码后可进行营养筛查';
        }  else if (option.from == 'product') {
            tip = '将二维码展示给患者，扫码后可直接购买产品';
        } else {
            tip = '将二维码展示给患者，扫码后可进行线上问诊';
            title = '邀请患者线上问诊';
        }
        this.setData({
            tip: tip,
            title: title
        });
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onChangeTab(e) {
        this.type = e.detail.index == 0 ? 6 : 1;
        this.setData({
            barcodeUrl: e.detail.index == 0 ? this.getQrCode() : this.data.doctorInfo.barcodeUrl,
            tip: e.detail.index == 0 ? '将二维码展示给患者，扫码后可加入我的科室' : '将二维码展示给患者，扫码后可进行线上问诊',
            title: e.detail.index == 0 ? '邀请患者加入科室' : '邀请患者线上问诊',
            active: e.detail.index,
        });
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
        var path = `/pages/index/index?type=4&subType=${this.type}&uId=${this.uId}&dId=${this.dId}`;
        if (this.data.from == 'screen') {
            path += `&stype=${this.stype || -1}`
        }
        if (this.data.from == 'team') {
            path += '&dpId=' + this.dpId;
        }
        if (this.data.from == 'product') {
            path += '&pId=' + this.pId;
        }
        return {
            title: this.dName + '-' + this.jobTitle + '（点击向医生发起问诊！）',
            path: path,
            imageUrl: this.data.barcodeUrl || '/image/logo.png'
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
    getQrCode() {
        if (this.qrMap[this.type]) {
            this.setData({
                barcodeUrl: this.qrMap[this.type]
            });
            return;
        }
        let stype = this.type == 2 && this.stype ? ',stype=' + this.stype : '';
        let pId = this.type == 8 && this.pId ? ',pId=' + this.pId : '';
        return wx.jyApp.http({
            url: '/wx/share/barcode',
            data: {
                page: 'pages/index/index',
                scene: `type=${this.type},dId=${this.dId},uId=${this.uId}${stype}${pId}`
            }
        }).then((data) => {
            this.qrMap[this.type] = data.barcode;
            this.setData({
                barcodeUrl: data.barcode
            });
        });
    }
})