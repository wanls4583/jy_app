/*
 * @Author: lisong
 * @Date: 2021-01-12 18:41:39
 * @Description: 
 */
Page({
    data: {
        diagnosisArr: [],
        diagnosisList: [],
        diagnosisVisible: false
    },
    onLoad() {
        var guideOrderDetail = wx.jyApp.getTempData('guideOrderDetail');
        this.guidanceData = wx.jyApp.getTempData('guidanceData');
        this.setData({
            from: this.guidanceData.from
        });
        if(this.guidanceData.diagnosisArr) {
            this.setData({
                diagnosisArr: this.guidanceData.diagnosisArr
            });
        } else if (guideOrderDetail){
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
        var item = e.currentTarget.dataset.item;
        var index = e.currentTarget.dataset.index;
        item.selected = true;
        this.data.diagnosisArr.push(item);
        this.setData({
            [`diagnosisList[${index}]`]: item,
            diagnosisArr: this.data.diagnosisArr.concat([])
        });
        this.guidanceData.diagnosisArr = this.data.diagnosisArr;
    },
    onDelete(e) {
        var index = e.currentTarget.dataset.index;
        this.data.diagnosisArr.splice(index, 1);
        this.setData({
            diagnosisArr: this.data.diagnosisArr.concat([])
        });
        this.guidanceData.diagnosisArr = this.data.diagnosisArr;
    },
    onInput(e) {
        var text = e.detail.value;
        //搜索诊断
        this.setData({
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