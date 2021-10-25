Page({
    data: {
        formats: {},
        readOnly: false,
        placeholder: '请输入正文...',
        editorHeight: 300,
        keyboardHeight: 0,
        isIOS: false,
        editorFocus: false,
        side: ['USER', 'DOCTOR'],
        title: '',
        content: '',
    },
    readOnlyChange() {
        this.setData({
            readOnly: !this.data.readOnly
        })
    },
    onLoad() {
        const platform = wx.getSystemInfoSync().platform
        const isIOS = platform === 'ios'
        this.setData({
            isIOS
        })
        const that = this
        this.imgMap = {};
        this.imgId = 0;
        this.updatePosition(0)
        let keyboardHeight = 0
        wx.onKeyboardHeightChange(res => {
            if (res.height === keyboardHeight) return
            const duration = res.height > 0 ? res.duration * 1000 : 0
            setTimeout(() => {
                keyboardHeight = that.data.editorFocus && res.height || 0
                wx.pageScrollTo({
                    scrollTop: 0,
                    success() {
                        that.updatePosition(keyboardHeight)
                        that.editorCtx.scrollIntoView()
                    }
                })
            }, duration)

        })
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
    },
    onEditFocus() {
        this.setData({
            editorFocus: true
        });
    },
    onEditBlur() {
        this.setData({
            editorFocus: false
        });
    },
    updatePosition(keyboardHeight) {
        const toolbarHeight = 50
        const titleHeight = 50
        const {
            windowHeight
        } = wx.getSystemInfoSync()
        let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : (windowHeight - 60)
        this.setData({
            editorHeight: editorHeight - titleHeight - 20,
            keyboardHeight
        });
    },
    onEditorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editorCtx = res.context
            that.data.content && that.editorCtx.setContents({
                html: that.data.content
            });
        }).exec()
    },
    format(e) {
        let {
            name,
            value
        } = e.target.dataset
        if (!name) return
        this.editorCtx.format(name, value)
    },
    onStatusChange(e) {
        const formats = e.detail
        this.setData({
            formats
        })
    },
    onSubmit() {
        if (!this.data.title) {
            wx.jyApp.toast('请输入标题');
            return;
        }
        wx.jyApp.showLoading('保存中...', true);
        var that = this;
        this.editorCtx.getContents({
            success: function (res) {
                if (!res.text.replace(/\s|\n/, '')) {
                    wx.jyApp.toast('请输入正文');
                    return;
                }
                _replaceImg(res.html);
            }
        });

        function _replaceImg(html) {
            var reg = /<img [^>]+?data-custom="id=(\d+)">/mg;
            var result = null;
            while (result = reg.exec(html)) {
                if (!that.imgMap[result[1]]) {
                    setTimeout(() => {
                        _replaceImg(html);
                    }, 500);
                    return;
                }
                html = html.replace(result[0], '<img src="' + that.imgMap[result[1]] + '" width="100%">');
                reg.lastIndex = 0
            }
            that.submit(html);
        }
    },
    submit(html) {
        wx.jyApp.http({
            url: `/article/${this.data.id?'update':'save'}`,
            method: 'post',
            data: {
                id: this.data.id,
                title: this.data.title,
                content: html,
                side: this.data.side.length >= 2 ? 'ALL' : this.data.side[0]
            }
        }).then(() => {
            wx.hideLoading();
            wx.jyApp.toastBack('保存成功');
        }).catch(() => {
            wx.hideLoading();
        });
    },
    insertImage() {
        const that = this
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var id = ++that.imgId;
                that.uploadImg(id, res.tempFilePaths[0]);
                that.editorCtx.insertImage({
                    src: res.tempFilePaths[0],
                    data: {
                        id: id
                    },
                    width: '100%',
                    success: function () {
                        console.log('insert image success')
                    }
                })
            }
        })
    },
    uploadImg(id, path) {
        var that = this;
        wx.uploadFile({
            url: `${wx.jyApp.httpHost}/oss/upload?token=` + wx.getStorageSync('token'),
            filePath: path,
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
                    wx.jyApp.toast('图片上传失败');
                }
                if (data.url) {
                    that.imgMap[id] = data.url;
                }
            }
        });
    }
})