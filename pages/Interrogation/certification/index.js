import area from '../../../data/area.js';
Page({
    data: {
        avatar: {},
        jobCertificateUrl: [],
        jobTitleCertificateUrl: [],
        phone: '',
        activeNames: ['1', '2', '3', '4'],
        doctorName: '',
        idNumber: '',
        introduce: '',
        goodAtDomain: '',
        checkedDisease: '',
        diseaseVisible: false,
        diseaseList: [],
        workDepartmentName: '',
        jobDepartmentName: '',
        onlineDepartmentName: [],
        departmentList: [],
        workHospitalName: '',
        jobTitle: '',
        cityCode: '',
        provinceCity: '',
        positionVisible: false,
        areaVisible: false,
        positionList: ['营养师', '主任医师', '副主任医师', '主治医师', '医师'],
        areaList: [],
        progressMap: {},
        approveStatus: -1,
        approveMsg: ''
    },
    onLoad(option) {
        this.loadDepartmentList();
        this.loadDiseaseList();
        this.setData({
            areaList: area
        });
        this.avatar = [];
        this.jobCertificateUrl = [];
        this.jobTitleCertificateUrl = [];
        this.pciMap = {};
        this.taskMap = {};
        this.loadLoaclInfo();
    },
    onHide() {
        this.saveLoaclInfo();
    },
    onUnload() {
        this.saveLoaclInfo();
    },
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [prop]: e.detail
        });
    },
    onCollapseChange(event) {
        this.setData({
            activeNames: event.detail,
        });
    },
    onShowArea() {
        this.setData({
            areaVisible: !this.data.areaVisible
        });
    },
    onConfirmArea(e) {
        var arr = e.detail.values;
        var cityCode = arr[arr.length - 1].code;
        var area = '';
        arr.map((item) => {
            area += item.name;
        });
        this.setData({
            areaVisible: false,
            cityCode: cityCode,
            provinceCity: area
        });
    },
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.cityCode);
        this.setData({
            areaVisible: false
        });
    },
    onDiseaseChange(e) {
        this.setData({
            goodAtDomain: e.detail.value.join('、')
        });
    },
    onClickDepartment(e) {
        var index = e.currentTarget.dataset.index;
        var department = this.data.departmentList[index];
        department.selected = !department.selected;
        index = this.data.onlineDepartmentName.indexOf(department.departmentName);
        if (index == -1) {
            this.data.onlineDepartmentName.push(department.departmentName);
        } else {
            this.data.onlineDepartmentName.splice(index, 1);
        }
        this.setData({
            departmentList: this.data.departmentList,
            onlineDepartmentName: this.data.onlineDepartmentName
        });
    },
    onConfirmPosition(e) {
        this.setData({
            jobTitle: e.detail.value,
            positionVisible: false
        });
    },
    onShowDisease() {
        this.setData({
            diseaseVisible: !this.data.diseaseVisible
        });
    },
    onShowPosition() {
        this.setData({
            positionVisible: !this.data.positionVisible
        });
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
                        wx.jyApp.toast('部分文件大于3M，已取消');
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
                    self.avatar = [];
                    self.uploadImages(files, self.avatar);
                }
            }
        });
    },
    //选择执业证书图片
    onChoosePracticeImage() {
        var self = this;
        wx.chooseImage({
            count: 5 - self.data.jobCertificateUrl.length,
            success(res) {
                var files = [];
                res.tempFiles.map((item) => {
                    if (files.length + self.data.jobCertificateUrl.length < 5) {
                        if (item.size < 1024 * 1024 * 3) {
                            files.push({
                                path: item.path,
                                id: wx.jyApp.utils.getUUID()
                            });
                        } else {
                            wx.jyApp.toast('部分文件大于3M，已取消');
                        }
                    }
                });
                self.setData({
                    jobCertificateUrl: self.data.jobCertificateUrl.concat(files)
                });
                self.uploadImages(files, self.jobCertificateUrl);
            }
        })
    },
    //删除执业证书
    delPracticePic(e) {
        var index = e.currentTarget.dataset.index;
        var item = this.data.jobCertificateUrl[index];
        this.data.jobCertificateUrl.splice(index, 1);
        this.setData({
            jobCertificateUrl: this.data.jobCertificateUrl
        });
        var url = this.pciMap[item.id];
        index = this.jobCertificateUrl.indexOf(url);
        index > -1 && this.jobCertificateUrl.splice(index, 1);
        if (this.taskMap[item.id]) { //删除正在上传的该图片任务
            this.taskMap[item.id].abort();
            delete this.taskMap[item.id];
        }
    },
    //选择职称证书图片
    onChoosePositionImage() {
        var self = this;
        wx.chooseImage({
            count: 5 - self.data.jobTitleCertificateUrl.length,
            success(res) {
                var files = [];
                res.tempFiles.map((item) => {
                    if (files.length + self.data.jobTitleCertificateUrl.length < 5) {
                        if (item.size < 1024 * 1024 * 3) {
                            files.push({
                                path: item.path,
                                id: wx.jyApp.utils.getUUID()
                            });
                        } else {
                            wx.jyApp.toast('部分文件大于3M，已取消');
                        }
                    }
                });
                self.setData({
                    jobTitleCertificateUrl: self.data.jobTitleCertificateUrl.concat(files)
                });
                self.uploadImages(files, self.jobTitleCertificateUrl);
            }
        })
    },
    //删除职称证书
    delPositionPic(e) {
        var index = e.currentTarget.dataset.index;
        var item = this.data.jobTitleCertificateUrl[index];
        this.data.jobTitleCertificateUrl.splice(index, 1);
        this.setData({
            jobTitleCertificateUrl: this.data.jobTitleCertificateUrl
        });
        var url = this.pciMap[item.id];
        index = this.jobTitleCertificateUrl.indexOf(url);
        index > -1 && this.jobTitleCertificateUrl.splice(index, 1);
        if (this.taskMap[item.id]) { //删除正在上传的该图片任务
            this.taskMap[item.id].abort();
            delete this.taskMap[item.id];
        }
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
                        picUrls.push(data.url);
                        self.pciMap[item.id] = data.url;
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
    loadDepartmentList() {
        wx.jyApp.http({
            url: '/department/list'
        }).then((data) => {
            if (this.data.onlineDepartmentName.length) {
                data.list.map((item) => {
                    if (this.data.onlineDepartmentName.indexOf(item.departmentName) > -1) {
                        item.selected = true;
                    }
                });
            }
            this.setData({
                departmentList: data.list
            });
        })
    },
    //获取擅长列表
    loadDiseaseList() {
        wx.jyApp.http({
            url: '/sys/config/list',
            data: {
                configNames: 'goodAtDomain'
            }
        }).then((data) => {
            if (data.list.length) {
                this.setData({
                    diseaseList: data.list[0].goodAtDomain.split('#')
                });
            }
        })
    },
    getData() {
        return {
            avatar: this.avatar[0],
            cityCode: this.data.cityCode,
            provinceCity: this.data.provinceCity,
            doctorName: this.data.doctorName,
            goodAtDomain: this.data.goodAtDomain,
            idNumber: this.data.idNumber,
            introduce: this.data.introduce,
            jobCertificateUrl: this.jobCertificateUrl.join(','),
            jobDepartmentName: this.data.jobDepartmentName,
            jobTitle: this.data.jobTitle,
            jobTitleCertificateUrl: this.jobTitleCertificateUrl.join(','),
            onlineDepartmentName: this.data.onlineDepartmentName.join(','),
            phone: this.data.phone,
            workDepartmentName: this.data.workDepartmentName,
            workHospitalName: this.data.workHospitalName
        }
    },
    onSave() {
        if (!this.data.doctorName) {
            wx.jyApp.toast('姓名不能为空');
            return;
        }
        if (!this.data.avatar) {
            wx.jyApp.toast('个人头像不能为空');
            return;
        }
        if (!/1\d{10}/.test(this.data.phone)) {
            wx.jyApp.toast('手机号输入错误');
            return;
        }
        if (!this.data.idNumber) {
            wx.jyApp.toast('身份证不能为空');
            return;
        }
        if (!this.data.onlineDepartmentName.length) {
            wx.jyApp.toast('请选择营养中心');
            return;
        }
        if (!this.data.goodAtDomain) {
            wx.jyApp.toast('擅长不能为空');
            return;
        }
        if (!this.data.introduce) {
            wx.jyApp.toast('个人简介不能为空');
            return;
        }
        if (!this.data.workDepartmentName) {
            wx.jyApp.toast('就职科室不能为空');
            return;
        }
        if (!this.data.jobDepartmentName) {
            wx.jyApp.toast('执业科室不能为空');
            return;
        }
        if (!this.data.workHospitalName) {
            wx.jyApp.toast('执业医院不能为空');
            return;
        }
        if (!this.data.jobCertificateUrl.length) {
            wx.jyApp.toast('请上传执业证');
            return;
        }
        if (!this.data.jobTitle) {
            wx.jyApp.toast('职称不能为空');
            return;
        }
        if (!this.data.jobTitleCertificateUrl.length) {
            wx.jyApp.toast('请上传职称证');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/approve/submit',
            method: 'post',
            data: this.getData()
        }).then(() => {
            wx.hideLoading();
            wx.removeStorageSync('approvInfo');
        });
    },
    saveLoaclInfo() {
        if (this.data.approveStatus != 1) {
            var data = this.getData();
            data.approveStatus = this.data.approveStatus;
            data.approveMsg = this.data.approveMsg;
            wx.setStorage({ key: 'approvInfo', data: data });
        }
    },
    loadLoaclInfo() {
        var data = wx.getStorageSync('approvInfo');
        if (data) {
            this.setInfo(data);
        } else {
            this.loadInfo();
        }
    },
    loadInfo() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/approve/history'
        }).then((data) => {
            if (data.list) {
                data = data.list[0];
                this.setInfo(data);
            }
        }).finally(() => {
            wx.hideLoading();
        });
    },
    setInfo(data) {
        for (var key in data) {
            this.setData({
                [key]: data[key]
            });
        }
        this.avatar = data.avatar && [data.avatar] || [];
        this.jobCertificateUrl = data.jobCertificateUrl && data.jobCertificateUrl.split(',') || [];
        this.jobTitleCertificateUrl = data.jobTitleCertificateUrl && data.jobTitleCertificateUrl.split(',') || [];
        this.data.onlineDepartmentName = data.onlineDepartmentName && data.onlineDepartmentName.split(',') || [];
        if (this.data.departmentList.length) {
            this.data.departmentList.map((item) => {
                if (this.data.onlineDepartmentName.indexOf(item.departmentName) > -1) {
                    item.selected = true;
                }
            });
        }
        this.setData({
            departmentList: this.data.departmentList,
            onlineDepartmentName: this.data.onlineDepartmentName,
            avatar: this.avatar.map((item) => {
                var id = wx.jyApp.utils.getUUID();
                this.pciMap[id] = item;
                return { path: item, id: id }
            })[0],
            jobCertificateUrl: this.jobCertificateUrl.map((item) => {
                var id = wx.jyApp.utils.getUUID();
                this.pciMap[id] = item;
                return { path: item, id: id }
            }),
            jobTitleCertificateUrl: this.jobTitleCertificateUrl.map((item) => {
                var id = wx.jyApp.utils.getUUID();
                this.pciMap[id] = item;
                return { path: item, id: id }
            })
        })
    }
})