Page({
    data: {
        picList: [],
        detail: '',
        activeNames: ['1', '2'],
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
        departmentList: ['营养科', '中医科', '肛肠科']
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
    chooseImage() {
        var self = this;
        wx.chooseImage({
            success(res) {
                const tempFilePaths = res.tempFilePaths
                console.log(res);
                self.setData({
                    picList: self.data.picList.concat(tempFilePaths)
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
    delPic(e) {
        var index = e.currentTarget.dataset.index;
        this.data.picList.splice(index, 1);
        this.setData({
            picList: this.data.picList
        });
    }
})