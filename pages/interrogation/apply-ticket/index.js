Page({
    data: {
        orderId: '',
        orderNo: '',
        ticketMoney: '',
        ticketType: 1,
        orderType: '',
        ticketContent: '',
        title: '',
        taxNumber: '',
        mailAddress: '',
        bankName: '',
        bankCardNumber: '',
        phone: '',
        address: '',
    },
    onLoad(option) {
        this.setData({
            orderId: option.id,
            orderNo: option.orderNo,
            ticketMoney: option.ticketMoney,
            orderType: option.orderType,
            ticketContent: '明细'
        });
    },
    onChange(e) {
        var ticketType = e.currentTarget.dataset.tickettype;
        this.setData({
            ticketType: ticketType,
            ticketContent: ticketType == 1 ? '明细' : (this.data.orderType <= 2 ? '服务费用' : '产品费用')
        });
    },
    onInput(e) {
        wx.jyApp.utils.onInput(e, this);
    },
    onSubmit() {
        if (!this.data.title) {
            wx.jyApp.toast('请输入发票抬头');
            return;
        }
        if (!wx.jyApp.utils.emailReg.test(this.data.mailAddress)) {
            wx.jyApp.toast('请输入正确的邮箱地址');
            return;
        }
        if (this.data.ticketType == 2 && !this.data.taxNumber) {
            wx.jyApp.toast('请输入识别号');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/orderticket/save',
            method: 'post',
            data: {
                orderId: this.data.orderId,
                ticketType: this.data.ticketType,
                orderType: this.data.orderType,
                title: this.data.title,
                taxNumber: this.data.taxNumber,
                mailAddress: this.data.mailAddress,
                bankName: this.data.bankName,
                bankCardNumber: this.data.bankCardNumber,
                phone: this.data.phone,
                address: this.data.address,
            }
        }).then(() => {
            wx.jyApp.hasTicketId = this.data.orderId;
            wx.navigateBack();
            setTimeout(() => {
                wx.showToast({ title: '提交成功' });
            }, 500);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})