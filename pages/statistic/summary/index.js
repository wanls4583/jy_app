/*
 * @Author: lisong
 * @Date: 2020-12-25 15:03:28
 * @Description: 
 */
Page({
    data: {
        startDateVisible: false,
        endDateVisible: false,
        previous: null,
        startDate: new Date().getTime(),
        endDate: new Date().getTime(),
    },
    onLoad() {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.loadData();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShow() {

    },
    onClickTab(e) {
        if (e.detail.title == '自定义') {
            this.setData({
                startDateVisible: true
            });
        }
    },
    onChangeTab(e) {
        switch (e.detail.title) {
            case '今天':
                this.setData({
                    startDate: new Date().getTime(),
                    endDate: new Date().getTime()
                });
                break;
            case '昨天':
                var startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime();
                this.setData({
                    startDate: startDate,
                    endDate: startDate
                });
                break;
            case '本月':
                var date = new Date();
                var startDate = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
                var endDate = 0;
                if (date.getMonth() >= 11) {
                    endDate = new Date(date.getFullYear() + 1, 0, 1).getTime();
                } else {
                    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
                }
                endDate = new Date(endDate - 1000).getTime();
                this.setData({
                    startDate: startDate,
                    endDate: endDate
                });
                break;
            case '上月':
                var date = new Date();
                if (date.getMonth() == 0) {
                    this.setData({
                        startDate: new Date(date.getFullYear() - 1, 11, 1).getTime(),
                        endDate: new Date(date.getFullYear() - 1, 11, 31).getTime()
                    });
                } else {
                    var startDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                    var endDate = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
                    endDate = new Date(endDate - 1000).getTime();
                    this.setData({
                        startDate: startDate,
                        endDate: endDate
                    });
                }
                break;
        }
        if (e.detail.title != '自定义') {
            this.loadData();
        }
    },
    onConfirmStartDate(e) {
        this.setData({
            startDateVisible: false,
            endDateVisible: true,
            startDate: e.detail
        })
    },
    onCancelStart() {
        this.setData({
            startDateVisible: false,
            endDateVisible: true,
        })
    },
    onConfirmEndDate(e) {
        this.setData({
            endDate: e.detail,
            endDateVisible: false
        })
        this.loadData();
    },
    onCancelEnd() {
        this.setData({
            endDate: this.data.endDate > this.data.startDate ? this.data.endDate : this.data.startDate,
            endDateVisible: false
        })
        this.loadData();
    },
    onClick(e) {
        var indicator = e.currentTarget.dataset.indicator;
        var title = e.currentTarget.dataset.title;
        if (['totalUsers', 'totalDoctors'].indexOf(indicator) > -1) {
            wx.jyApp.toast('暂不支持查看该项详情数据');
            return;
        }
        var startDate = new Date(this.data.startDate).formatTime('yyyy-MM-dd');
        var endDate = new Date(this.data.endDate).formatTime('yyyy-MM-dd');
        wx.jyApp.utils.navigateTo({
            url: `/pages/statistic/statistic-detail/index?indicator=${indicator}&startDate=${startDate}&endDate=${endDate}&title=${title}`
        });
    },
    resetData() {
        this.setData({
            consultOrderAmount: 0,
            consultOrderAmountPercent: 0,
            consultOrderNum: 0,
            consultOrderNumPercent: 0,
            consultVideoOrderAmount: 0,
            consultVideoOrderAmountPercent: 0,
            consultVideoOrderNum: 0,
            consultVideoOrderNumPercent: 0,
            emallOrderAmount: 0,
            emallOrderAmountPercent: 0,
            emallOrderNum: 0,
            emallOrderNumPercent: 0,
            emallOrderUsers: 0,
            emallOrderUsersPercent: 0,
            increaseDoctors: 0,
            increaseDoctorsPercent: 0,
            increaseUsers: 0,
            increaseUsersPercent: 0,
            loginDoctors: 0,
            loginDoctorsPercent: 0,
            loginUsers: 0,
            loginUsersPercent: 0,
            nutritionApplyAmount: 0,
            nutritionApplyAmountPercent: 0,
            nutritionApplyNum: 0,
            nutritionApplyNumPercent: 0,
            nutritionOrderAmount: 0,
            nutritionOrderAmountPercent: 0,
            nutritionOrderNum: 0,
            nutritionOrderNumPercent: 0,
            nutritionOrderUsers: 0,
            nutritionOrderUsersPercent: 0,
            totalDoctors: 0,
            totalDoctorsPercent: 0,
            totalUsers: 0,
            totalUsersPercent: 0,
            tradeAmount: 0,
            tradeAmountPercent: 0,
            tradeNum: 0,
            tradeNumPercent: 0,
            tradeUsers: 0,
            tradeUsersPercent: 0,
        });
    },
    loadData() {
        this.resetData();
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.http({
            url: '/statistics/summary',
            data: {
                startDate: new Date(this.data.startDate).formatTime('yyyy-MM-dd'),
                endDate: new Date(this.data.endDate).formatTime('yyyy-MM-dd')
            }
        }).then((data) => {
            data.current = data.current || {};
            data.previous = data.previous || {};
            this.setData({
                previous: data.previous
            });
            data = {
                consultOrderAmount: data.current.consultOrderAmount,
                consultOrderAmountPercent: ((data.current.consultOrderAmount - data.previous.consultOrderAmount) / data.previous.consultOrderAmount * 100).toFixed(2),
                consultOrderNum: data.current.consultOrderNum,
                consultOrderNumPercent: ((data.current.consultOrderNum - data.previous.consultOrderNum) / data.previous.consultOrderNum * 100).toFixed(2),
                consultOrderUsers: data.current.consultOrderUsers,
                consultOrderUsersPercent: ((data.current.consultOrderUsers - data.previous.consultOrderUsers) / data.previous.consultOrderUsers * 100).toFixed(2),
                consultVideoOrderAmount: data.current.consultVideoOrderAmount,
                consultVideoOrderAmountPercent: ((data.current.consultVideoOrderAmount - data.previous.consultVideoOrderAmount) / data.previous.consultVideoOrderAmount * 100).toFixed(2),
                consultVideoOrderNum: data.current.consultVideoOrderNum,
                consultVideoOrderNumPercent: ((data.current.consultVideoOrderNum - data.previous.consultVideoOrderNum) / data.previous.consultVideoOrderNum * 100).toFixed(2),
                consultVideoOrderUsers: data.current.consultVideoOrderUsers,
                consultVideoOrderUsersPercent: ((data.current.consultVideoOrderUsers - data.previous.consultVideoOrderUsers) / data.previous.consultVideoOrderUsers * 100).toFixed(2),
                emallOrderAmount: data.current.emallOrderAmount,
                emallOrderAmountPercent: ((data.current.emallOrderAmount - data.previous.emallOrderAmount) / data.previous.emallOrderAmount * 100).toFixed(2),
                emallOrderNum: data.current.emallOrderNum,
                emallOrderNumPercent: ((data.current.emallOrderNum - data.previous.emallOrderNum) / data.previous.emallOrderNum * 100).toFixed(2),
                emallOrderUsers: data.current.emallOrderUsers,
                emallOrderUsersPercent: ((data.current.emallOrderUsers - data.previous.emallOrderUsers) / data.previous.emallOrderUsers * 100).toFixed(2),
                increaseDoctors: data.current.increaseDoctors,
                increaseDoctorsPercent: ((data.current.increaseDoctors - data.previous.increaseDoctors) / data.previous.increaseDoctors * 100).toFixed(2),
                increaseUsers: data.current.increaseUsers,
                increaseUsersPercent: ((data.current.increaseUsers - data.previous.increaseUsers) / data.previous.increaseUsers * 100).toFixed(2),
                loginDoctors: data.current.loginDoctors,
                loginDoctorsPercent: ((data.current.loginDoctors - data.previous.loginDoctors) / data.previous.loginDoctors * 100).toFixed(2),
                loginUsers: data.current.loginUsers,
                loginUsersPercent: ((data.current.loginUsers - data.previous.loginUsers) / data.previous.loginUsers * 100).toFixed(2),
                nutritionApplyAmount: data.current.nutritionApplyAmount,
                nutritionApplyAmountPercent: ((data.current.nutritionApplyAmount - data.previous.nutritionApplyAmount) / data.previous.nutritionApplyAmount * 100).toFixed(2),
                nutritionApplyNum: data.current.nutritionApplyNum,
                nutritionApplyNumPercent: ((data.current.nutritionApplyNum - data.previous.nutritionApplyNum) / data.previous.nutritionApplyNum * 100).toFixed(2),
                nutritionApplyUsers: data.current.nutritionApplyUsers,
                nutritionApplyUsersPercent: ((data.current.nutritionApplyUsers - data.previous.nutritionApplyUsers) / data.previous.nutritionApplyUsers * 100).toFixed(2),
                nutritionOrderAmount: data.current.nutritionOrderAmount,
                nutritionOrderAmountPercent: ((data.current.nutritionOrderAmount - data.previous.nutritionOrderAmount) / data.previous.nutritionOrderAmount * 100).toFixed(2),
                nutritionOrderNum: data.current.nutritionOrderNum,
                nutritionOrderNumPercent: ((data.current.nutritionOrderNum - data.previous.nutritionOrderNum) / data.previous.nutritionOrderNum * 100).toFixed(2),
                nutritionOrderUsers: data.current.nutritionOrderUsers,
                nutritionOrderUsersPercent: ((data.current.nutritionOrderUsers - data.previous.nutritionOrderUsers) / data.previous.nutritionOrderUsers * 100).toFixed(2),
                totalDoctors: data.current.totalDoctors,
                totalDoctorsPercent: ((data.current.totalDoctors - data.previous.totalDoctors) / data.previous.totalDoctors * 100).toFixed(2),
                totalUsers: data.current.totalUsers,
                totalUsersPercent: ((data.current.totalUsers - data.previous.totalUsers) / data.previous.totalUsers * 100).toFixed(2),
                tradeAmount: data.current.tradeAmount,
                tradeAmountPercent: ((data.current.tradeAmount - data.previous.tradeAmount) / data.previous.tradeAmount * 100).toFixed(2),
                tradeNum: data.current.tradeNum,
                tradeNumPercent: ((data.current.tradeNum - data.previous.tradeNum) / data.previous.tradeNum * 100).toFixed(2),
                tradeUsers: data.current.tradeUsers,
                tradeUsersPercent: ((data.current.tradeUsers - data.previous.tradeUsers) / data.previous.tradeUsers * 100).toFixed(2),
            };
            for (var key in data) {
                if (data[key] == 'NaN' || data[key] == '-NaN') {
                    data[key] = 0;
                }
                data[key] = data[key] || 0;
                this.setData({
                    [`${key}`]: data[key]
                });
            }
        }).catch((e) => {
            console.log(e);
        }).finally(() => {
            wx.hideLoading();
        });
    }
})