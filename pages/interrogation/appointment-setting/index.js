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
        var morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
        var afternoon = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
        var night = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
        var title = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        var timeArr = [];
        this.title = title;
        for (var i = 0; i < 7; i++) {
            timeArr[i] = {
                title: title[i],
                morning: morning.filter((item) => {
                    var videoServiceTime = this.data.doctorInfo.videoServiceTime;
                    if (videoServiceTime && videoServiceTime[i + 1]) {
                        return videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                afternoon: afternoon.filter((item) => {
                    var videoServiceTime = this.data.doctorInfo.videoServiceTime;
                    if (videoServiceTime && videoServiceTime[i + 1]) {
                        return videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
                night: night.filter((item) => {
                    var videoServiceTime = this.data.doctorInfo.videoServiceTime;
                    if (videoServiceTime && videoServiceTime[i + 1]) {
                        return videoServiceTime[i + 1].indexOf(item) > -1;
                    }
                    return false;
                }),
            }
        }
        this.setData({
            timeArr: timeArr,
            morning: morning.map((item) => {
                return {
                    time: item,
                    checked: false
                }
            }),
            afternoon: afternoon.map((item) => {
                return {
                    time: item,
                    checked: false
                }
            }),
            night: night.map((item) => {
                return {
                    time: item,
                    checked: false
                }
            })
        });
    },
    onUnload() {
        if (wx.jyApp.tempData.setTimeCallback) {
            var videoServiceTime = {};
            this.data.timeArr.map((item, index) => {
                videoServiceTime[index + 1] = [];
                item.morning && item.morning.map((time) => {
                    videoServiceTime[index + 1].push(time);
                });
                item.afternoon && item.afternoon.map((time) => {
                    videoServiceTime[index + 1].push(time);
                });
                item.night && item.night.map((time) => {
                    videoServiceTime[index + 1].push(time);
                });
            });
            wx.jyApp.tempData.setTimeCallback(videoServiceTime);
            delete wx.jyApp.tempData.setTimeCallback;
        }
        this.storeBindings.destroyStoreBindings();
    },
    onShowTime() {
        this.setData({
            timeVisible: !this.data.timeVisible
        });
    },
    onClickTime(e) {
        var type = e.currentTarget.dataset.type;
        var index = e.currentTarget.dataset.index;
        var itemObj = e.currentTarget.dataset.item;
        var timeTitle = this.title[index];
        this.timeArrType = type;
        this.timeArrIndex = index;
        switch (type) {
            case 'morning': timeTitle += '上午'; break;
            case 'afternoon': timeTitle += '下午'; break;
            case 'night': timeTitle += '晚上'; break;
        }
        this.setData({
            slectTimes: this.data[type].map((item) => {
                return {
                    time: item.time,
                    checked: itemObj[type].indexOf(item.time) > -1
                }
            }),
            timeTitle: timeTitle
        });
        this.onShowTime();
    },
    onCheckedTime(e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            [`slectTimes[${index}]`]: {
                time: this.data.slectTimes[index].time,
                checked: !this.data.slectTimes[index].checked
            }
        });
        var arr = this.data.slectTimes.filter((item) => {
            return item.checked;
        }).map((item) => {
            return item.time;
        });
        this.setData({
            [`timeArr[${this.timeArrIndex}].${this.timeArrType}`]: arr
        });
    }
})