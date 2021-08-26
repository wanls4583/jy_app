/*
 * @Author: lisong
 * @Date: 2021-01-12 15:05:51
 * @Description: 
 */
Page({
    data: {
        list: [],
        page: 1,
        totalPage: -1,
        stopRefresh: false
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'userInfo']
        });
        this.storeBindings.updateStoreBindings();
    },
    onShow() {
        this.loadList(true);
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onEdit(e) {
        var item = e.currentTarget.dataset.item;
        var url = '';
        switch (item.filtrateType) {
            case 'NRS 2002':
            case 'NRS2002':
                url = '/pages/screen/nrs/index';
                break;
            case 'PG-SGA':
            case 'PGSGA':
                url = '/pages/screen/pgsga/index';
                break;
            case 'SGA':
                url = '/pages/screen/sga/index';
                break;
            case 'MUST':
                url = '/pages/screen/must/index';
                break;
            case 'MNA':
                url = '/pages/screen/mna/index';
                break;
            case 'FAT':
                url = '/pages/screen/fat/index';
                break;
            case 'FAT-GROW':
                url = '/pages/screen/birth-history/index';
                break;
            case 'FAT-HOME':
                url = '/pages/screen/family-history/index';
                break;
            case 'FAT-DISEASE':
                url = '/pages/screen/disease-history/index';
                break;
            case 'FAT-TREAT':
                url = '/pages/screen/fat-history/index';
                break;
            case 'FAT-DIET':
                url = '/pages/screen/food-investigate/index';
                break;
            case 'FAT-SIT':
                url = '/pages/screen/sit-investigate/index';
                break;
            case 'FAT-SLEEP':
                url = '/pages/screen/sleep-assess/index';
                break;
            case 'FAT-ACTION':
                url = '/pages/screen/act-assess/index';
                break;
            case 'FAT-BODY':
                url = '/pages/screen/body-fat/index';
                break;
            case 'TUNOUR_FLUID':
                url = '/pages/screen/tumour-fluid/index';
                break;
            case 'ORAL_MUCOSA':
                url = '/pages/screen/oral-mucosa/index';
                break;
        }
        wx.jyApp.utils.navigateTo({
            url: `${url}?id=${item.id}`
        });
    },
    onDelete(e) {
        var id = e.currentTarget.dataset.id;
        wx.jyApp.dialog.confirm({
            message: '确定删除？'
        }).then(() => {
            wx.jyApp.http({
                url: '/patient/filtrate/delete',
                method: 'post',
                data: {
                    id: id
                }
            }).then((data) => {
                wx.jyApp.toast('操作成功');
                this.onRefresh();
            });
        });
    },
    loadList(refresh) {
        if (refresh) {
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/patient/filtrate/list',
            data: {
                page: refresh ? 1 : this.data.page,
                limit: 20,
            }
        });
        this.request.then((data) => {
            if (refresh) {
                this.setData({
                    page: 1,
                    totalPage: -1,
                    list: []
                });
            }
            data.page.list = data.page.list || [];
            data.page.list.map((item) => {
                item._sex = item.sex == 1 ? '男' : '女';
                item.BMI = (item.weight) / (item.height * item.height / 10000);
                item.BMI = item.BMI && item.BMI.toFixed(1) || '';
                item._filtrateType = item.filtrateType;
                item._filtrateResult = item.filtrateResult;
                item.resultDescription = item.resultDescription && item.resultDescription.split(';') || [];
                if (item.filtrateType == 'PG-SGA') {
                    if (item.answers) {
                        try {
                            item.answers = JSON.parse(item.answers);
                            this.setPgsgaResult(item.answers, item.resultDescription);
                        } catch (e) {}
                    }
                }
                if (item.filtrateType == 'FAT') {
                    item._filtrateType = '超重与肥胖';
                    if (item.filtrateResult == 1) {
                        item._filtrateResult = '体重正常';
                    }
                    if (item.filtrateResult == 2) {
                        item._filtrateResult = '超重';
                    }
                    if (item.filtrateResult == 3) {
                        item._filtrateResult = '肥胖';
                    }
                    if (item.filtrateResult == 4) {
                        item._filtrateResult = '中心性肥胖（BMI超重）';
                    }
                    if (item.filtrateResult == 5) {
                        item._filtrateResult = '中心性肥胖（BMI肥胖）';
                    }
                }
                if (item.filtrateType == 'FAT-GROW') {
                    item._filtrateType = '出生、喂养史、发育史';
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-HOME') {
                    item._filtrateType = '家族史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-DISEASE') {
                    item._filtrateType = '疾病史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-TREAT') {
                    item._filtrateType = '肥胖治疗史'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-DIET') {
                    item._filtrateType = '膳食调查'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-SIT') {
                    item._filtrateType = '久坐行为调查'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-SLEEP') {
                    item._filtrateType = '睡眠评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-ACTION') {
                    item._filtrateType = '身体活动水平评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'FAT-BODY') {
                    item._filtrateType = '体脂肪含量测量'
                    item.label = '评估';
                }
                if (item.filtrateType == 'TUNOUR_FLUID') {
                    item._filtrateType = '肿瘤恶液质评估'
                    item.label = '评估';
                }
                if (item.filtrateType == 'ORAL_MUCOSA') {
                    item._filtrateType = '口腔黏膜风险评估'
                    item.label = '评估';
                }
            });
            this.data.list = this.data.list.concat(data.page.list);
            this.setData({
                list: this.data.list,
                page: this.data.page + 1,
                totalPage: data.page.totalPage,
            });
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
    },
    setPgsgaResult(pgsga, resultDescription) {
        if (pgsga.dieteticChange) {
            var arr = [];
            var index = pgsga.dieteticChange.indexOf('NORMAL_FEED');
            if (index > -1) {
                arr.push('比正常量少的一般食物');
            }
            index = pgsga.dieteticChange.indexOf('SOLID_FEED');
            if (index > -1) {
                arr.push('一点固体食物');
            }
            index = pgsga.dieteticChange.indexOf('FLUID_FEED');
            if (index > -1) {
                arr.push('只有流质饮食');
            }
            index = pgsga.dieteticChange.indexOf('ONLY_NUTRITION');
            if (index > -1) {
                arr.push('只有营养补充品');
            }
            index = pgsga.dieteticChange.indexOf('LITTLE_FEED');
            if (index > -1) {
                arr.push('非常少的任何食物');
            }
            index = pgsga.dieteticChange.indexOf('INJECTABLE_FEED');
            if (index > -1) {
                arr.push('通过管饲进食或由静脉注射营养');
            }
            if (arr.length) {
                resultDescription.push('我现在只吃：' + arr.join('、'));
            }
        }
        if (pgsga.symptom) {
            var arr = [];
            var index = pgsga.symptom.indexOf('恶心');
            if (index > -1) {
                arr.push('恶心');
            }
            index = pgsga.symptom.indexOf('呕吐');
            if (index > -1) {
                arr.push('呕吐');
            }
            index = pgsga.symptom.indexOf('便秘');
            if (index > -1) {
                arr.push('便秘');
            }
            index = pgsga.symptom.indexOf('腹泻');
            if (index > -1) {
                arr.push('腹泻');
            }
            index = pgsga.symptom.indexOf('口腔溃疡');
            if (index > -1) {
                arr.push('口腔溃疡');
            }
            index = pgsga.symptom.indexOf('吞咽困难');
            if (index > -1) {
                arr.push('吞咽困难');
            }
            if (arr.length) {
                resultDescription.push('症状：' + arr.join('、'));
            }
        }
        if (pgsga.edemaOfAbdominal > 0) {
            var str = '';
            switch (Number(pgsga.edemaOfAbdominal)) {
                case 1:
                    str = '轻度异常';
                    break;
                case 2:
                    str = '中度异常';
                    break;
                case 3:
                    str = '严重异常';
                    break;
            }
            resultDescription.push('腹水：' + str);
        }
    }
})