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
        this.doctorId = option.doctorId;
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.Promise.all([this.getDoctorInfo(this.doctorId), this.getVideoServiceTime(this.doctorId)]).then(() => {
            wx.hideLoading();
            this.initData();
        });
    },
    onUnload() {
    },
    initData() {
        var morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        var afternoon = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
        var night = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
        var nowDay = new Date().getDay();
        var title = _getTitle();
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
                return {
                    title: itemObj.title,
                    time: item,
                    checked: this.bookedTimes[day] && this.bookedTimes[day][item]
                }
            }),
            timeTitle: timeTitle
        });
        this.onShowTime();
    },
    onCheckedTime(e) {
        var itemObj = e.currentTarget.dataset.item;
        var date = new Date(itemObj.title.value);
        wx.jyApp.tempData.bookDateTime = Date.prototype.parseDateTime(date.formatTime('yyyy-MM-dd ') + itemObj.time + ':00');
        wx.navigateBack();
    },
    getVideoServiceTime(doctorId) {
        return wx.jyApp.http({
            url: '/consultorder/book/query',
            data: {
                doctorId: doctorId
            }
        }).then((data) => {
            this.bookedTimes = data.bookedTimes;
            for (var key in this.bookedTimes) {
                var item = this.bookedTimes[key];
                var timeMap = {};
                item.map((_item) => {
                    timeMap[_item.time] = _item.patientName;
                });
                this.bookedTimes[key] = timeMap;
            }
            return data.bookedTimes;
        });
    },
    getDoctorInfo(doctorId) {
        return wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
            this.videoServiceTime = data.doctor.videoServiceTime;
            return data.doctor.videoServiceTime;
        });
    }
})