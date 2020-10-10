Page({
    data: {
        orderTicket: {}
    },
    onLoad(option) {
        this.orderId = option.id;
        this.orderType = option.orderType;
        this.loadInfo();
    },
    loadInfo() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/orderticket/info',
            data: {
                oid: this.orderId,
                type: this.orderType
            }
        }).then((data) => {
            data.orderTicket.ticketContent = data.orderTicket.ticketType <= 2 ? '服务费用' : '产品费用';
            this.setData({
                orderTicket: data.orderTicket
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
    onPreview() {
        wx.downloadFile({
            url: this.data.orderType.ticketUrl,
            success: function (res) {
                const filePath = res.tempFilePath
                wx.openDocument({
                    filePath: filePath,
                    success: function (res) {
                        console.log('打开文档成功')
                    },
                    fail: function (res) {
                        wx.jyApp.log.info('打开发票原文件失败', res);
                    }
                })
            },
            fail: function (res) {
                wx.jyApp.log.info('下载发票原文件失败', res);
            }
        });
    }
})