/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
 * @Description: 
 */
Page({
    data: {
        active: 0
    },
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