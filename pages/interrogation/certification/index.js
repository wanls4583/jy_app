Page({
    data: {
        practicePics: [],
        positionPics: [],
        detail: '',
        activeNames: ['1', '2', '3', '4'],
        name: '',
        card: '',
        introduction: '',
        avater: '',
        disease: '',
        checkedDisease: '',
        diseaseVisible: false,
        diseaseList: ['糖尿病', '肺炎', '感冒'],
        department1: '',
        department2: '',
        department3: '',
        departmentVisible: false,
        departmentList: ['营养科', '中医科', '肛肠科'],
        practiceHospital: '',
        practicePosition: '',
        positionVisible: false,
        positionList: ['营养师', '主任医师', '副主任医师', '主治医师', '医师']
    },
    onLoad(option) {

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
    onDiseaseChange(e) {
        this.setData({
            disease: e.detail.value.join('、')
        });
    },
    onConfirmDepartment(e) {
        this.setData({
            department3: e.detail.value,
            departmentVisible: false
        });
    },
    onConfirmPosition(e) {
        this.setData({
            practicePosition: e.detail.value,
            positionVisible: false
        });
    },
    onShowDisease() {
        this.setData({
            diseaseVisible: !this.data.diseaseVisible
        });
    },
    onShowDepartment() {
        this.setData({
            departmentVisible: !this.data.departmentVisible
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
            success(res) {
                const tempFilePaths = res.tempFilePaths
                self.setData({
                    avater: tempFilePaths[0]
                });
            }
        });
    },
    onChoosePracticeImage() {
        var self = this;
        wx.chooseImage({
            success(res) {
                const tempFilePaths = res.tempFilePaths
                console.log(res);
                self.setData({
                    practicePics: self.data.practicePics.concat(tempFilePaths)
                });
                // wx.uploadFile({
                //     url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
                //     filePath: tempFilePaths[0],
                //     name: 'file',
                //     formData: {
                //         'user': 'test'
                //     },
                //     success(res) {
                //         const data = res.data
                //         //do something
                //     }
                // })
            }
        })
    },
    delPracticPic(e) {
        var index = e.currentTarget.dataset.index;
        this.data.practicePics.splice(index, 1);
        this.setData({
            practicePics: this.data.practicePics
        });
    },
    onChoosePositionImage() {
        var self = this;
        wx.chooseImage({
            success(res) {
                const tempFilePaths = res.tempFilePaths
                console.log(res);
                self.setData({
                    positionPics: self.data.positionPics.concat(tempFilePaths)
                });
            }
        })
    },
    delPositionPic(e) {
        var index = e.currentTarget.dataset.index;
        this.data.positionPics.splice(index, 1);
        this.setData({
            positionPics: this.data.positionPics
        });
    },
    onSave() {
        if (!this.data.name) {
            wx.jyApp.toast('姓名不能为空');
            return;
        }
        if (!this.data.card) {
            wx.jyApp.toast('身份证不能为空');
            return;
        }
        if (!this.data.avater) {
            wx.jyApp.toast('个人头像不能为空');
            return;
        }
        if (!this.data.disease) {
            wx.jyApp.toast('擅长不能为空');
            return;
        }
        if (!this.data.introduction) {
            wx.jyApp.toast('个人简介不能为空');
            return;
        }
        if (!this.data.department1) {
            wx.jyApp.toast('就职科室不能为空');
            return;
        }
        if (!this.data.department2) {
            wx.jyApp.toast('执业科室不能为空');
            return;
        }
        if (!this.data.department3) {
            wx.jyApp.toast('线上科室不能为空');
            return;
        }
        if (!this.data.practiceHospital) {
            wx.jyApp.toast('执业医院不能为空');
            return;
        }
        if (!this.data.practicePics.lenght) {
            wx.jyApp.toast('请上传执业证');
            return;
        }
        if (!this.data.practicePosition) {
            wx.jyApp.toast('职称不能为空');
            return;
        }
        if (!this.data.positionPics.lenght) {
            wx.jyApp.toast('请上传职称证');
            return;
        }
    }
})