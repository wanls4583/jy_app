Page({
    data: {
        picList: [],
        picUrls: [],
        diseaseDetail: '',
        progressMap: {},
        pciMap: {},
        doctor: null
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData'],
        });
        this.storeBindings.updateStoreBindings();
        this.doctorId = option.doctorId || '';
        this.type = option.type || 1;
        this.taskMap = {}
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
        for (var key in this.taskMap) {
            this.taskMap[key].abort();
        }
    },
    onInput(e) {
        this.setData({
            diseaseDetail: e.detail.value
        });
    },
    onNext() {
        if (this.data.diseaseDetail.length < 10) {
            wx.jyApp.toast('病情描述不能少于10个字');
            return;
        }
        this.getDoctorInfo().then(() => {
            if (!this.stopNext) {
                wx.jyApp.tempData.illness = {
                    diseaseDetail: this.data.diseaseDetail,
                    picUrls: this.data.picUrls,
                    doctorId: this.doctorId,
                    doctorName: this.data.doctor.doctorName,
                    consultOrderPrice: this.type == 3 ? this.data.doctor.videoOrderPrice : this.data.doctor.consultOrderPrice,
                    type: this.type,
                    bookDateTime: wx.jyApp.tempData.bookDateTime
                }
                delete wx.jyApp.tempData.bookDateTime;
                wx.jyApp.selectPatientFlag = true;
                wx.jyApp.utils.navigateTo({
                    url: '/pages/interrogation/user-patient-list/index?selectPatient=1'
                });
            }
        });

    },
    getDoctorInfo() {
        wx.jyApp.showLoading('加载中...', true);
        if (this.doctorId) {
            return wx.jyApp.loginUtil.getDoctorInfo(this.doctorId).then((data) => {
                wx.hideLoading();
                if (data.doctor.consultOrderSwitch != 1 || data.doctor.authStatus != 1 || data.doctor.status != 1) {
                    this.stopNext = true;
                    wx.navigateBack();
                    setTimeout(() => {
                        wx.jyApp.toast('医生已下线');
                    }, 500);
                    return;
                }
                if (data.doctor.incomeSwitch != 1) {
                    data.doctor.consultOrderPrice = 0;
                }
                this.setData({
                    doctor: data.doctor
                });
            }).catch(() => {
                wx.hideLoading();
            });
        } else {
            return wx.jyApp.http({
                url: '/doctor/recommend',
                data: {
                    diseaseDetail: this.data.diseaseDetail
                }
            }).then((data) => {
                wx.hideLoading();
                if (data.doctor) {
                    this.doctorId = data.id;
                    this.setData({
                        doctor: data.doctor
                    });
                } else {
                    this.stopNext = true;
                    wx.navigateBack();
                    setTimeout(() => {
                        wx.jyApp.toast('暂无合适的医生');
                    }, 500);
                }
            }).catch(() => {
                wx.hideLoading();
            });
        }
    },
    chooseImage() {
        var self = this;
        wx.chooseImage({
            sizeType: ['compressed'],
            count: 9 - self.data.picList.length,
            success(res) {
                var files = [];
                res.tempFiles.map((item) => {
                    if (self.data.picList.length < 9 && self.data.picList.indexOf(item.path) == -1) {
                        if (item.size < 1024 * 1024) {
                            files.push(item.path);
                            self.data.picList.push(item.path);
                        } else {
                            wx.jyApp.toast('部分文件大于1M，已取消');
                        }
                    }
                });
                self.setData({
                    picList: self.data.picList
                });
                files.map((item) => {
                    self.taskMap[item] = wx.uploadFile({
                        url: `${wx.jyApp.httpHost}/oss/upload?token=` + wx.getStorageSync('token'),
                        filePath: item,
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
                            delete self.taskMap[item];
                            if (data.url) {
                                self.data.picUrls.push(data.url);
                                self.data.pciMap[item] = data.url;
                                self.data.progressMap[item] = 101;
                            } else {
                                self.data.progressMap[item] = -1
                            }
                            self.setData({
                                progressMap: self.data.progressMap
                            });
                        },
                        fail() {
                            wx.jyApp.toast('上传失败');
                        }
                    });
                    self.taskMap[item].onProgressUpdate((data) => {
                        if (data.progress == 100) {
                            data.progress = 99.99;
                        }
                        self.data.progressMap[item] = data.progress
                        self.setData({
                            progressMap: self.data.progressMap
                        });
                    });
                });
            }
        })
    },
    delPic(e) {
        var index = e.currentTarget.dataset.index;
        var fileName = this.data.picList[index];
        if (this.taskMap[fileName]) {
            delete this.taskMap[fileName];
        } else {
            var _index = this.data.picUrls.indexOf(this.data.pciMap[fileName]);
            this.data.picUrls.splice(_index, 1);
        }
        this.data.picList.splice(index, 1);
        this.setData({
            picList: this.data.picList
        });
    }
})