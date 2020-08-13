const app = getApp()

Page({
    data: {
        picList: [],
        detail: '',
    },
    onLoad(option) {

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