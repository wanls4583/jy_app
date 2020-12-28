/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
import * as echarts from '../ec-canvas/echarts';
Page({
    data: {
        ecs: [],
        summary: 0,
        consume: 0,
        refund: 0
    },
    onLoad(option) {
        this.indicator = option.indicator;
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
            title: this.title,
            startDate: option.startDate,
            endDate: option.endDate
        });
        this.loadData();
    },
    onUnload() {
    },
    loadData() {
        wx.jyApp.http({
            url: '/statistics/detail',
            data: {
                startDate: this.data.startDate,
                endDate: this.data.endDate,
                indicator: this.indicator,
            }
        }).then((data) => {
            var ecs = [];
            var consume = 0;
            var refund = 0;
            data.list = data.list || [];
            this.prop.map((item, index) => {
                data.list.map((item) => {
                    consume += (item.consume || 0);
                    refund += (item.refund || 0);
                });
                ecs[index] = {
                    onInit: this.createInitFun(data.list, item),
                    disableTouch: true
                }
            });
            this.setData({
                ecs: ecs,
                summary: data.summary,
                consume: consume.toFixed(2),
                refund: refund.toFixed(2),
            });
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
                grid: {
                    top: 30,
                    bottom: 30,
                    left: '10%',
                    right: '10%'
                },
                color: ["#07c160"],
                xAxis: {
                    type: 'category',
                    data: list.map((item) => { return item.date })
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: "#07c160"
                        }
                    },
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