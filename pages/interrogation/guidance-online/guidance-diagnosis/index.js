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
        focus: false
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
        if(!item.selected) {
            if(this.data.diagnosisArr.length >= 5) {
                wx.jyApp.toast('最多添加5个临床诊断');
                return;
            }
            item.selected = true;
            this.data.diagnosisArr.push(item);
        } else {
            item.selected = false;
            this.data.diagnosisArr = this.data.diagnosisArr.filter((_item)=>{
                return _item.diagnosisName != item.diagnosisName;
            });
        }
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
        this.allDiagnosisList.map((item)=>{
            item.selected = false; 
        });
        this.setData({
            diagnosisVisible: !this.data.diagnosisVisible,
            diagnosisList: [],
            text: ''
        }, ()=>{
            if(this.data.diagnosisVisible) {
                setTimeout(()=>{
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
                wx.hideLoading();
            }
        }
    }
})