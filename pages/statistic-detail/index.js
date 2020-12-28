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
        this.title = [option.title];
        this.prop = ['total']
        if (this.title[0].indexOf('实际') > -1) {
            this.prop[1] = 'consume';
            this.prop[2] = 'refund';
            this.title[1] = this.title[0].replace('实际', '');
            if (this.title[1].indexOf('消费') == -1) {
                this.title[1] = '消费' + this.title[1];
            }
            this.title[2] = this.title[1].replace('消费', '退费');
        }
        this.setData({
            title: this.title
        });
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
        }).then((data) => {
            this.prop.map((item, index) => {
                this.render(data.list, item, index);
            });
        });
    },
    render(list, prop, index) {
        new wxCharts({
            canvasId: 'canvas' + index,
            type: 'column',
            dataLabel: false,
            legend: false,
            categories: list.map((item) => { return item.date }),
            series: [{
                name: '实际消费',
                color: '#07c160',
                data: list.map((item) => { return item[prop] })
            }],
            yAxis: {
                fontColor: '#07c160',
                format: function (val) {
                    return val;
                }
            },
            width: this.systemInfo.windowWidth,
            height: this.systemInfo.windowWidth * 0.62
        });
    }
})