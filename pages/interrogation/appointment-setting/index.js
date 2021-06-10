/*
 * @Author: lisong
 * @Date: 2020-12-03 14:40:09
 * @Description: 
 */
Page({
    data: {
        bookedTimes: {},
        phoneBookedTimes: {},
        videoServiceTime: null,
        phoneServiceTime: null,
        orderType: 4
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
    },
    onUnload() {
        if (wx.jyApp.tempData.setTimeCallback) {
            wx.jyApp.tempData.setTimeCallback(this.data.videoServiceTime, this.data.phoneServiceTime);
            delete wx.jyApp.tempData.setTimeCallback;
        }
        this.storeBindings.destroyStoreBindings();
    },
    onChageVideoTime(e) {
        var timeArr = e.detail;
        var videoServiceTime = {};
        timeArr.map((item, index) => {
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
        this.setData({
            videoServiceTime: videoServiceTime
        });
        console.log(this.data.videoServiceTime);
    },
    onChagePhoneTime(e) {
        var timeArr = e.detail;
        var phoneServiceTime = {};
        timeArr.map((item, index) => {
            phoneServiceTime[index + 1] = [];
            item.morning && item.morning.map((time) => {
                phoneServiceTime[index + 1].push(time);
            });
            item.afternoon && item.afternoon.map((time) => {
                phoneServiceTime[index + 1].push(time);
            });
            item.night && item.night.map((time) => {
                phoneServiceTime[index + 1].push(time);
            });
        });
        this.setData({
            phoneServiceTime: phoneServiceTime
        });
        console.log(this.data.phoneServiceTime);
    },
    onChange(e) {
        var orderType = e.currentTarget.dataset.orderType;
        this.setData({
            orderType: orderType,
        });
    },
    getBookedTimes(doctorId) {
        return wx.jyApp.http({
            url: '/consultorder/book/query',
            data: {
                doctorId: doctorId
            }
        }).then((data) => {
            var bookedTimes = data.bookedTimes || {};
            var phoneBookedTimes = data.phoneBookedTimes || {};
            for (var key in bookedTimes) {
                var item = bookedTimes[key];
                var timeMap = {};
                item.map((_item) => {
                    timeMap[_item.time] = _item;
                });
                bookedTimes[key] = timeMap;
            }
            for (var key in phoneBookedTimes) {
                var item = phoneBookedTimes[key];
                var timeMap = {};
                item.map((_item) => {
                    timeMap[_item.time] = _item;
                });
                phoneBookedTimes[key] = timeMap;
            }
            this.setData({
                bookedTimes: bookedTimes,
                phoneBookedTimes: phoneBookedTimes
            });
        });
    },
})