/*
 * @Author: lisong
 * @Date: 2021-01-12 18:41:39
 * @Description: 
 */
Page({
    data: {
        diagnosis: [],
        diagnosisList: [],
        diagnosisVisible: false
    },
    onLoad(option) {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        this.guidanceData = wx.jyApp.getTempData('guidanceData');
        if (guideOrderDetail && !this.guidanceData.diagnosis) {
            this.setData({
                diagnosis: guideOrderDetail.diagnosis
            });
            this.guidanceData.diagnosis = this.data.diagnosis;
        }
        if (this.guidanceData.from == 'examine') {
            wx.setNavigationBarTitle({
                title: '审核营养处方'
            });
        }
        this.getAllDiagnosisList();
    },
    onShow() {

    },
    onPre(e) {
        wx.navigateBack();
    },
    onNext(e) {
        if (this.data.diagnosis.length) {
            wx.jyApp.utils.navigateTo({
                url: '/pages/interrogation/guidance-online/guidance-product/index'
            });
        } else {
            wx.jyApp.toast('请添加临床诊断');
        }
    },
    onSelect(e) {
        var item = e.currentTarget.dataset.item;
        var index = e.currentTarget.dataset.index;
        item.selected = true;
        this.data.diagnosis.push(item);
        this.setData({
            [`diagnosisList[${index}]`]: item,
            diagnosis: this.data.diagnosis.concat([])
        });
        this.guidanceData.diagnosis = this.data.diagnosis;
    },
    onDelete(e) {
        var index = e.currentTarget.dataset.index;
        this.data.diagnosis.splice(index, 1);
        this.setData({
            diagnosis: this.data.diagnosis.concat([])
        });
        this.guidanceData.diagnosis = this.data.diagnosis;
    },
    onInput(e) {
        var text = e.detail.value;
        //搜索诊断
        this.setData({
            diagnosisList: this.allDiagnosisList.filter((item) => {
                if (item.diagnosisName.indexOf(text) > -1) {
                    this.data.diagnosis.map((_item) => {
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
            text: ''
        });
    },
    getAllDiagnosisList() {
        var self = this;
        wx.jyApp.showLoading('加载中...', true);
        _get();

        function _get() {
            self.allDiagnosisList = wx.getStorageSync('diagnosis');
            if (!self.allDiagnosisList) {
                setTimeout(() => {
                    _get();
                }, 1000);
            } else {
                wx.hideLoading();
            }
        }
    }
})