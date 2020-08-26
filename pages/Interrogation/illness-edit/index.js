Page({
    data: {
        picList: [],
        picUrls: [],
        diseaseDetail: '',
        processMap: {},
        pciMap: {}
    },
    onLoad(option) {
        this.taskMap = {}
    },
    onUnload() {
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
        if(!this.data.diseaseDetail) {
            wx.jyApp.toast('请输入病情描述');
            return;
        }
        wx.jyApp.illness = {
            diseaseDetail: this.data.diseaseDetail,
            picUrls: this.data.picUrls
        }
        wx.navigateTo({
            url: '/pages/interrogation/user-patient-list/index'
        });
    },
    chooseImage() {
        var self = this;
        wx.chooseImage({
            sizeType: ['compressed'],
            success(res) {
                var files = [];
                res.tempFiles.map((item) => {
                    if (self.data.picList.length < 9 && self.data.picList.indexOf(item.path) == -1) {
                        if (item.size < 1024 * 1024 * 3) {
                            files.push(item.path);
                            self.data.picList.push(item.path);
                        } else {
                            wx.jyApp.toast('部分文件大于3M，已取消');
                        }
                    }
                });
                self.setData({
                    picList: self.data.picList
                });
                files.map((item) => {
                    self.taskMap[item] = wx.uploadFile({
                        url: 'http://dev.juyuanyingyang.com/ihospital/app/api/oss/upload?token=' + wx.getStorageSync('token'),
                        filePath: item,
                        name: 'file',
                        header: {
                            Accept: 'application/json',
                            'Content-Type': 'multipart/form-data'
                        },
                        success(res) {
                            var data = JSON.parse(res.data);
                            delete self.taskMap[item];
                            if (data.url) {
                                self.data.picUrls.push(data.url);
                                self.data.pciMap[item] = data.url;
                            } else {
                                self.data.processMap[item] = -1
                                self.setData({
                                    processMap: self.data.processMap
                                });
                            }
                        }
                    });
                    self.taskMap[item].onProgressUpdate((data) => {
                        self.data.processMap[item] = data.progress
                        self.setData({
                            processMap: self.data.processMap
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