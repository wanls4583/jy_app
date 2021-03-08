/*
 * @Author: lisong
 * @Date: 2021-01-27 18:14:26
 * @Description: 
 */
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    properties: {
        patient: {
            type: Object,
            value: {}
        },
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                if (newVal) {
                    wx.nextTick(() => {
                        this.onAdd();
                        this.loadList(true);
                    });
                }
            }
        }
    },
    data: {
        dateVisible: false,
        checkDate: 0,
        ward: {},
        listVisible: false,
        dataList: [],
    },
    lifetimes: {
        attached() {
            this._attached();
        }
    },
    attached: function () {
        this._attached();
    },
    methods: {
        _attached() {
            var userInfo = wx.getStorageSync('mobileUserInfo');
            this.setData({
                doctorName: userInfo.name,
            });
        },
        onInput(e) {
            wx.jyApp.utils.onInput(e, this);
        },
        onShowList() {
            this.setData({
                listVisible: !this.data.listVisible
            });
        },
        onShowDate() {
            this.setData({
                dateVisible: true
            });
        },
        onConfirmDate(e) {
            var checkDate = new Date(e.detail).formatTime('yyyy-MM-dd hh:mm');
            this.setData({
                'ward.checkDate': checkDate,
                dateVisible: false
            });
        },
        onCancelDate() {
            this.setData({
                dateVisible: false
            });
        },
        onChange(e) {
            var prop = e.currentTarget.dataset.prop;
            this.setData({
                [`${prop}`]: e.detail,
            });
        },
        onAdd() {
            this.setData({
                checkDate: new Date().getTime(),
                ward: {
                    id: '',
                    checkDate: new Date().formatTime('yyyy-MM-dd hh:mm'),
                    tolerance_select: [],
                    tolerance_count1: '',
                    tolerance_count2: '',
                    tolerance_count3: '',
                    tolerance_ml1: '',
                    tolerance_ml2: '',
                    tolerance_ml3: '',
                    tolerance_xingzhuang: '',
                    tolerance_day: '',
                    tolerance_mmol1: '',
                    tolerance_mmol2: '',
                    tolerance_mmol3: '',
                    tolerance_mmol4: '',
                    tolerance_reason: '',
                    tolerance_remark: '',
                    changePlan_select: '',
                    changePlan_remark: ''
                },
            })
        },
        onSetInfo(e) {
            var item = e.currentTarget.dataset.item;
            this.setInfo(item);
            this.setData({
                listVisible: false
            });
        },
        onDelete(e) {
            var id = e.currentTarget.dataset.id;
            wx.jyApp.dialog.confirm({
                message: '确认删除？'
            }).then(() => {
                wx.jyApp.showLoading('删除中...', true);
                wx.jyApp.http({
                    type: 'mobile',
                    method: 'get',
                    url: '/app/nutrition/delete',
                    data: {
                        method: 'checkWard',
                        id: id
                    }
                }).then(() => {
                    wx.jyApp.toast('删除成功');
                    this.data.dataList = this.data.dataList.filter((item) => {
                        return item.id != id;
                    });
                    this.setData({
                        listVisible: false,
                        dataList: this.data.dataList
                    });
                    if (this.nowId == id) {
                        this.setInfo(this.data.dataList[0]);
                    }
                }).finally(() => {
                    wx.hideLoading();
                });
            });
        },
        loadList(refresh) {
            refresh && wx.jyApp.showLoading('加载中', true);
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'checkWard',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient
                }
            }).then((data) => {
                data.result.rows.sort((a, b)=>{
                    return b.checkDate - a.checkDate
                });
                this.setData({
                    dataList: data.result.rows
                });
                if (!this.nowId) {
                    this.setInfo(data.result.rows[0]);
                }
            }).finally(() => {
                refresh && wx.hideLoading();
            });
        },
        setInfo(ward) {
            this.nowId = ward.id;
            var data = Object.assign({}, ward);
            var tolerance = JSON.parse(data.tolerance);
            var changePlan = JSON.parse(data.changePlan);
            for (var key in tolerance) {
                data[key] = tolerance[key];
            }
            for (var key in changePlan) {
                data[key] = changePlan[key];
            }
            this.setData({
                ward: data,
                checkDate: Date.prototype.parseDateTime(ward.checkDate).getTime()
            });
        },
        getSaveData() {
            var data = {
                ...this.data.ward,
                inHospitalNumber: this.properties.patient.inHospitalNumber,
                isInpatient: this.properties.patient.isInpatient,
            }
            data.tolerance = JSON.stringify({
                tolerance_select: data.tolerance_select,
                tolerance_count1: data.tolerance_count1,
                tolerance_count2: data.tolerance_count2,
                tolerance_count3: data.tolerance_count3,
                tolerance_ml1: data.tolerance_ml1,
                tolerance_ml2: data.tolerance_ml2,
                tolerance_ml3: data.tolerance_ml3,
                tolerance_xingzhuang: data.tolerance_xingzhuang,
                tolerance_day: data.tolerance_day,
                tolerance_mmol1: data.tolerance_mmol1,
                tolerance_mmol2: data.tolerance_mmol2,
                tolerance_mmol3: data.tolerance_mmol3,
                tolerance_mmol4: data.tolerance_mmol4,
                tolerance_reason: data.tolerance_reason,
                tolerance_remark: data.tolerance_remark
            });
            data.changePlan = JSON.stringify({
                changePlan_select: data.changePlan_select,
                changePlan_remark: data.changePlan_remark
            });
            return data;
        },
        onSave() {
            var data = this.getSaveData();
            wx.jyApp.showLoading('加载中...', true);
            _save.bind(this)();

            function _save() {
                wx.jyApp.http({
                    type: 'mobile',
                    method: 'post',
                    url: '/app/nutrition/saveOrUpdate',
                    data: {
                        method: 'checkWard',
                        params: JSON.stringify({
                            ...data
                        })
                    }
                }).then((_data) => {
                    setTimeout(()=>{
                        wx.jyApp.toast('保存成功');
                    });
                    if (!data.id) {
                        this.setData({
                            'ward.id': _data.result.data
                        });
                        this.nowId = _data.result.data;
                    }
                    this.loadList();
                }).finally(() => {
                    wx.hideLoading();
                });
            }
        }
    }
})