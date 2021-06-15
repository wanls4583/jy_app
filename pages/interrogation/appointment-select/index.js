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
        // 预约类型{3:'视频问诊',4:'电话问诊'}
        this.type = option.type;
        this.initTitle();
        wx.jyApp.showLoading('加载中...', true);
        wx.jyApp.Promise.all([this.getDoctorInfo(this.doctorId), this.getBookedTimes(this.doctorId)]).then(() => {
            wx.hideLoading();
            this.initData();
        });
        this.setData({
            orderType: this.type
        });
        wx.setNavigationBarTitle({
            title: this.type == 3 ? '视频问诊' : '电话问诊'
        });
    },
    onUnload() {},
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
            var dateTitle = [{
                dateStr: '今天',
                dayStr: title[day],
                day: day || 7,
                value: now.getTime()
            }];
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
                    if (this.serviceTime && this.serviceTime[i + 1]) {
                        return this.serviceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                afternoon: afternoon.filter((item) => {
                    if (this.serviceTime && this.serviceTime[i + 1]) {
                        return this.serviceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                night: night.filter((item) => {
                    if (this.serviceTime && this.serviceTime[i + 1]) {
                        return this.serviceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
            }
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
            case 'morning':
                timeTitle += '上午';
                break;
            case 'afternoon':
                timeTitle += '下午';
                break;
            case 'night':
                timeTitle += '晚上';
                break;
        }
        this.setData({
            slectTimes: itemObj[type].map((item) => {
                var checked = this.bookedTimes[day] && this.bookedTimes[day][item];
                var disabled = false;
                var date = Date.prototype.parseDateTime(new Date(itemObj.title.value).formatTime('yyyy-MM-dd ') + item + ':00');
                if (date.getTime() < new Date().getTime()) {
                    disabled = true;
                }
                return {
                    title: itemObj.title,
                    time: item,
                    disabled: disabled,
                    checked: checked
                }
            }),
            timeTitle: timeTitle
        });
        this.onShowTime();
    },
    onCheckedTime(e) {
        var itemObj = e.currentTarget.dataset.item;
        var date = new Date(itemObj.title.value);
        if (itemObj.disabled || itemObj.checked) {
            return;
        }
        wx.jyApp.http({
            url: '/consultorder/book/check',
            data: {
                doctorId: this.doctorId,
                type: this.type,
                bookDateTime: date.formatTime('yyyy-MM-dd ') + itemObj.time
            }
        }).then(() => {
            wx.jyApp.tempData.bookDateTime = Date.prototype.parseDateTime(date.formatTime('yyyy-MM-dd ') + itemObj.time + ':00');
            wx.redirectTo({
                url: `/pages/interrogation/illness-edit/index?type=${this.type}&doctorId=${this.doctorId}`
            });
        });
    },
    getBookedTimes(doctorId) {
        return wx.jyApp.http({
            url: '/consultorder/book/query',
            data: {
                doctorId: doctorId
            }
        }).then((data) => {
            this.bookedTimes = this.type == 3 ? data.bookedTimes : data.phoneBookedTimes;
            for (var day in this.bookedTimes) {
                var item = this.bookedTimes[day];
                var timeMap = {};
                item.map((_item) => {
                    timeMap[_item.time] = _item.patientName;
                    //某些已预约的时间点被医生取消，需要去并集显示已取消的点
                    if (this.serviceTime) {
                        if (!this.serviceTime[day]) {
                            this.serviceTime[day] = [_item.time];
                        } else {
                            this.serviceTime[day].push(_item.time);
                            this.serviceTime[day].sort();
                        }
                    }
                });
                this.bookedTimes[day] = timeMap;
            }
            return data.bookedTimes;
        });
    },
    getDoctorInfo(doctorId) {
        return wx.jyApp.loginUtil.getDoctorInfo(doctorId).then((data) => {
            this.serviceTime = this.type == 3 ? data.doctor.videoServiceTime : data.doctor.phoneServiceTime;
            //某些已预约的时间点被医生取消，需要去并集显示已取消的点
            if (this.bookedTimes) {
                for (var day in this.bookedTimes) {
                    for (var time in this.bookedTimes[day]) {
                        if (!this.serviceTime[day]) {
                            this.serviceTime[day] = [time];
                        } else {
                            this.serviceTime[day].push(time);
                            this.serviceTime[day].sort();
                        }
                    }
                }
            }
            return data.doctor.serviceTime;
        });
    }
})