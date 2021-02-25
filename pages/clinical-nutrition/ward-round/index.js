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
    },
    data: {
        checkDate: new Date().getTime(),
        dateVisible: false,
        ward: {
            id: '',
            checkDate: new Date().formatTime('yyyy-MM-dd'),
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
            tolerance_mmol3: '',
            tolerance_reason: '',
            tolerance_remark: '',
            changePlan_select: [],
            changePlan_remark: ''
        }
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
            wx.nextTick(() => {
                this.loadInfo();
            })
        },
        onInput(e) {
            wx.jyApp.utils.onInput(e, this);
        },
        onShowDate() {
            this.setData({
                dateVisible: true
            });
        },
        onConfirmDate(e) {
            var checkDate = new Date(e.detail).formatTime('yyyy-MM-dd');
            this.setData({
                'nrs.checkDate': checkDate,
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
        loadInfo(id) {
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'checkWard',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient
                }
            }).then((data) => {
                data = data.result.rows[0];
                this.setInfo(data);
            });
        },
        setInfo(ward) {
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
                checkDate: Date.prototype.parseDate(ward.checkDate).getTime()
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
                tolerance_mmol3: data.tolerance_mmol3,
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
                }).then(() => {
                    wx.jyApp.toast('保存成功');
                }).finally(() => {
                    wx.hideLoading();
                });
            }
        }
    }
})