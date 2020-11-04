/*
 * @Author: lisong
 * @Date: 2020-11-04 16:08:37
 * @Description: 
 */
Page({
    data: {
        traces: []
    },
    onLoad(option) {
        this.loadExpress(option.expressNumber);
    },
    //获取物流信息
    loadExpress(expressNumber) {
        wx.showLoading('加载中...', true);
        wx.jyApp.http({
            url: '/express',
            data: {
                expCode: 'SF',
                expNo: expressNumber
            }
        }).then((data) => {
            var traces = JSON.parse(data.result).Traces;
            traces.map((item) => {
                item.text = item.AcceptStation;
                item.desc = item.AcceptTime;
            });
            this.setData({
                traces: traces
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },
})