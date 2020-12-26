/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
import wxCharts from '../../lib/wxcharts';
Page({
    data: {
        value: ''
    },
    onLoad(option) {
        this.indicator = option.indicator;
        this.startDate = option.startDate;
        this.endDate = option.endDate;
        this.systemInfo = wx.getSystemInfoSync();
        this.loadData();
    },
    onUnload() {
    },
    loadData() {
        wx.jyApp.http({
            url: '/statistics/detail',
            data: {
                startDate: this.startDate,
                endDate: this.endDate,
                indicator: this.indicator,
            }
        }).then((data)=>{
            this.render1(data.list);
        });
    },
    render1(list) {
        list = list.concat(list);
        new wxCharts({
            canvasId: 'canvas1',
            type: 'column',
            categories: list.map((item)=>{return item.date}),
            series: [{
                name: '实际消费',
                data: list.map((item)=>{return item.total})
            }],
            yAxis: {
                format: function (val) {
                    return val;
                }
            },
            width: this.systemInfo.windowWidth,
            height: this.systemInfo.windowWidth * 0.62
        });
    }
})