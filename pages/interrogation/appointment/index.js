/*
 * @Author: lisong
 * @Date: 2020-12-03 14:40:09
 * @Description: 
 */
Page({
    data: {
        timeArr: [],
        morning: [],
        afternoon: [],
        night: [],
        slectTimes: [],
        timeVisible: false,
        timeTitle: ''
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.initTitle();
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.Promise.all([this.getVideoServiceTime(this.data.doctorInfo.id)]).then(() => {
            wx.hideLoading();
            this.videoServiceTime = this.data.doctorInfo.videoServiceTime;
            this.initData();
        }).catch((e) => {
            console.log(e);
        });
    },
    onUnload() {
    },
    initTitle() {
        var nowDay = new Date().getDay();
        var title = _getTitle();
        var timeArr = [];
        for (var i = 0; i < 7; i++) {
            timeArr[i] = {
                morning: [],
                afternoon: [],
                night: [],
            }
            timeArr[i].morningNum = 0;
            timeArr[i].afternoonNum = 0;
            timeArr[i].nightNum = 0;
        }
        timeArr = timeArr.slice(nowDay - 1).concat(timeArr.slice(0, nowDay - 1));
        timeArr.map((item, index) => {
            item.title = title[index];
        });
        this.setData({
            timeArr: timeArr
        });
        function _getTitle() {
            var title = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            var now = new Date();
            var day = now.getDay();
            var dateTitle = [{ dateStr: '今天', dayStr: title[day], day: day || 7, value: now.getTime() }];
            var oneDay = 24 * 60 * 60 * 1000;
            now = now.getTime();
            for (var i = 1; i <= 6; i++) {
                var date = new Date(now + i * oneDay);
                day = date.getDay();
                var obj = {
                    dateStr: date.formatTime('MM/dd'),
                    dayStr: title[day],
                    day: day || 7,
                    value: date.getTime()
                }
                dateTitle.push(obj);
            }
            return dateTitle;
        }
    },
    initData() {
        var morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        var afternoon = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
        var night = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
        var nowDay = new Date().getDay();
        var timeArr = [];
        for (var i = 0; i < 7; i++) {
            timeArr[i] = {
                morning: morning.filter((item) => {
                    if (this.videoServiceTime && this.videoServiceTime[i + 1]) {
                        return this.videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                afternoon: afternoon.filter((item) => {
                    if (this.videoServiceTime && this.videoServiceTime[i + 1]) {
                        return this.videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                night: night.filter((item) => {
                    if (this.videoServiceTime && this.videoServiceTime[i + 1]) {
                        return this.videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
            }
            var morningNum = timeArr[i].morning.filter((item) => {
                return this.bookedTimesNameMap[i + 1] && this.bookedTimesNameMap[i + 1][item];
            }).length;
            var afternoonNum = timeArr[i].afternoon.filter((item) => {
                return this.bookedTimesNameMap[i + 1] && this.bookedTimesNameMap[i + 1][item];
            }).length;
            var nightNum = timeArr[i].night.filter((item) => {
                return this.bookedTimesNameMap[i + 1] && this.bookedTimesNameMap[i + 1][item];
            }).length;
            timeArr[i].morningNum = morningNum;
            timeArr[i].afternoonNum = afternoonNum;
            timeArr[i].nightNum = nightNum;
        }
        timeArr = timeArr.slice(nowDay - 1).concat(timeArr.slice(0, nowDay - 1));
        timeArr.map((item, index) => {
            item.title = this.data.timeArr[index].title;
        });
        this.setData({
            timeArr: timeArr
        });
    },
    onShowTime() {
        this.setData({
            timeVisible: !this.data.timeVisible
        });
    },
    onClickTime(e) {
        var type = e.currentTarget.dataset.type;
        var itemObj = e.currentTarget.dataset.item;
        var day = itemObj.title.day;
        var timeTitle = `${itemObj.title.dateStr}（${itemObj.title.dayStr}）`;
        if (!itemObj[type].length) {
            return;
        }
        switch (type) {
            case 'morning': timeTitle += '上午'; break;
            case 'afternoon': timeTitle += '下午'; break;
            case 'night': timeTitle += '晚上'; break;
        }
        this.setData({
            slectTimes: itemObj[type].map((item) => {
                var _item = this.bookedTimesNameMap[day] && this.bookedTimesNameMap[day][item];
                return {
                    title: itemObj.title,
                    time: item,
                    patientName: _item && _item.patientName || '',
                    consultOrderId: _item && _item.consultOrderId || ''
                }
            }),
            timeTitle: timeTitle
        });
        this.onShowTime();
    },
    onCheckedTime(e) {
        var itemObj = e.currentTarget.dataset.item;
        if (itemObj.consultOrderId) {
            wx.jyApp.utils.navigateTo({
                url: `/pages/intterogation/apply-order-detail/index?id=${itemObj.consultOrderId}`
            });
        }
    },
    getVideoServiceTime(doctorId) {
        return wx.jyApp.http({
            url: '/consultorder/book/query',
            data: {
                doctorId: doctorId
            }
        }).then((data) => {
            this.bookedTimes = data.bookedTimes;
            this.bookedTimesNameMap = {};
            for (var key in this.bookedTimes) {
                var item = this.bookedTimes[key];
                var timeMap = {};
                item.map((_item) => {
                    timeMap[_item.time] = _item;
                });
                this.bookedTimesNameMap[key] = timeMap;
            }
            return data.bookedTimes;
        });
    }
})