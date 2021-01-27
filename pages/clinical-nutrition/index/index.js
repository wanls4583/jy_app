/*
 * @Author: lisong
 * @Date: 2021-01-06 09:52:03
 * @Description: 
 */
Page({
    data: {
        active: 0,
    },
    onLoad(option) {

    },
    onUnload() {},
    onChangeTab(e) {
        this.setData({
            active: e.detail.index
        });
    },
    onChangeSwiper(e) {
        this.setData({
            active: e.detail.current
        });
    },
})