/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
import * as echarts from '../ec-canvas/echarts';
Page({
    data: {
        value: '',
        ecs: [],
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
            var ecs = [];
            this.prop.map((item, index) => {
                if (data.list && data.list.length) {
                    ecs[index] = {
                        onInit: this.createInitFun(data.list, item)
                    }
                }
            });
            this.setData({
                ecs: ecs
            })
        });
    },
    createInitFun(list, prop) {
        function initChart(canvas, width, height, dpr) {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            });
            canvas.setChart(chart);

            var option = {
                color: ["#07c160"],
                xAxis: {
                    type: 'category',
                    data: list.map((item) => { return item.date })
                },
                yAxis: {
                    type: 'value',
                    nameTextStyle: {
                        color: "#07c160"
                    }
                },
                series: [{
                    data: list.map((item) => { return item[prop] }),
                    type: 'bar'
                }]
            };
            chart.setOption(option);
            return chart;
        }
        return initChart;
    }
})