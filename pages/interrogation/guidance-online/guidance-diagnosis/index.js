/*
 * @Author: lisong
 * @Date: 2021-01-12 18:41:39
 * @Description: 
 */
Page({
    data: {
        diagnosisArr: [],
        diagnosisList: [],
        diagnosisVisible: false,
        focus: false,
        searchText: '',
        defaultList: [],
        defaultNames: [
            '2型糖尿病性周围神经病',
            '2型糖尿病性肾病',
            '2型糖尿病足病',
            '摄入食物结构失衡',
            '吞咽困难',
            '喂养困难和照管不当',
            '肥胖症',
            '重度营养不良伴消瘦',
            '夸希奥科病[恶性营养不良病]',
            '蛋白质-能量营养不良',
            '恶病质',
            '营养风险',
            '低蛋白血症',
            '维生素缺乏病',
            '高钠血症',
            '高磷酸盐血症',
            '低钾血症',
            '营养性巨幼细胞性贫血',
            '营养性贫血，其他特指的',
            '缺铁性贫血',
            '骨质疏松  ',
            '骨质疏松伴有病理性骨折 ',
            '高钾血症',
            '乳糖不耐受',
            '高尿酸血症'
        ]
    },
    onLoad() {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        this.guidanceData = wx.jyApp.getTempData('guidanceData');
        this.setData({
            from: this.guidanceData.from
        });
        if (this.data.from == 'examine') {
            wx.setNavigationBarTitle({
                title: '处方审核'
            });
        }
        if (this.guidanceData.diagnosisArr) {
            this.setData({
                diagnosisArr: this.guidanceData.diagnosisArr
            });
        } else if (guideOrderDetail) {
            this.setData({
                diagnosisArr: guideOrderDetail.diagnosisArr || []
            });
            this.guidanceData.diagnosisArr = this.data.diagnosisArr;
        }
        this.getAllDiagnosisList();
    },
    onShow() {

    },
    onPre(e) {
        wx.navigateBack();
    },
    onNext(e) {
        if (this.data.diagnosisArr.length) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/guidance-product/index'
            });
        } else {
            wx.jyApp.toast('请添加临床诊断');
        }
    },
    onSelect(e) {
        let item = e.currentTarget.dataset.item;
        if (!item.selected) {
            if (this.data.diagnosisArr.length >= 5) {
                wx.jyApp.toast('最多添加5个临床诊断');
                return;
            }
            item.selected = true;
            this.data.diagnosisArr.push(item);
        } else {
            item.selected = false;
            this.data.diagnosisArr = this.data.diagnosisArr.filter((_item) => {
                return _item.diagnosisName != item.diagnosisName;
            });
        }
        this.setData({
            diagnosisArr: this.data.diagnosisArr.slice()
        });
        this.setSelected();
        this.guidanceData.diagnosisArr = this.data.diagnosisArr;
    },
    onDelete(e) {
        var index = e.currentTarget.dataset.index;
        this.data.diagnosisArr.splice(index, 1);
        this.setData({
            diagnosisArr: this.data.diagnosisArr.concat([])
        });
        this.guidanceData.diagnosisArr = this.data.diagnosisArr;
        this.setSelected();
    },
    onInput(e) {
        var text = e.detail.value;
        //搜索诊断
        this.setData({
            searchText: text,
            diagnosisList: this.allDiagnosisList.filter((item) => {
                if (text && item.diagnosisName.indexOf(text) > -1) {
                    this.data.diagnosisArr.map((_item) => {
                        if (item.diagnosisCode == _item.diagnosisCode) {
                            item.selected = true;
                        }
                    });
                    return true;
                }
                return false;
            })
        });
    },
    onClickTemplate() {
        this.setData({
            diagnosisVisible: !this.data.diagnosisVisible,
            diagnosisList: [],
            searchText: ''
        }, () => {
            if (this.data.diagnosisVisible) {
                setTimeout(() => {
                    this.setData({
                        focus: true
                    });
                }, 300);
            } else {
                this.setData({
                    focus: false
                });
            }
        });
    },
    getAllDiagnosisList() {
        var self = this;
        wx.jyApp.showLoading('加载中...', true);
        _get();

        function _get() {
            self.allDiagnosisList = wx.jyApp.getTempData('allDiagnosis');
            if (!self.allDiagnosisList) {
                setTimeout(() => {
                    _get();
                }, 1000);
            } else {
                self.setSelected();
                self.setData({
                    defaultList: self.allDiagnosisList.filter((item) => {
                        return self.data.defaultNames.indexOf(item.diagnosisName) > -1;
                    })
                })
                wx.hideLoading();
            }
        }
    },
    setSelected() {
        let map = {};
        this.data.diagnosisArr.map((item) => {
            map[item.diagnosisCode] = true;
        });
        this.allDiagnosisList.map((item) => {
            item.selected = map[item.diagnosisCode] || false;
        });
        this.setData({
            diagnosisList: this.data.diagnosisList.slice(),
            defaultList: this.data.defaultList.slice()
        })
    }
})