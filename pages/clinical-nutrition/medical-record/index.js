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
        show: {
            type: Boolean,
            value: false,
            observer: function (newVal, oldVal) {
                if (newVal) {
                    var self = this;
                    _waitData();

                    function _waitData() {
                        if (wx.jyApp.getTempData('medicalRecord')) {
                            self.loadData();
                        } else {
                            setTimeout(() => {
                                _waitData();
                            }, 100);
                        }
                    }
                }
            }
        }
    },
    data: {
        medicalRecord: null
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
        _attached() {},
        loadData() {
            var medicalRecord = wx.jyApp.getTempData('medicalRecord');
            for (var key in medicalRecord) {
                medicalRecord[key] = medicalRecord[key].data || {}
            }
            medicalRecord.patientDocument._sex = medicalRecord.patientDocument.sex == 1 ? '男' : '女';
            medicalRecord.patientDocument.hospitalizedDate = medicalRecord.patientDocument.hospitalizedDate && new Date(medicalRecord.patientDocument.hospitalizedDate).formatTime('yyyy-MM-dd') || '';
            medicalRecord.patientDocument.beginConsultDate = medicalRecord.patientDocument.beginConsultDate && new Date(medicalRecord.patientDocument.beginConsultDate).formatTime('yyyy-MM-dd') || '';
            if (medicalRecord.filtrate && medicalRecord.filtrate.rows) {
                medicalRecord.filtrate.rows.map((item) => {
                    item.filtratedDate = item.filtratedDate && new Date(item.filtratedDate).formatTime('yyyy-MM-dd') || '';
                });
            }
            if (medicalRecord.nutritionOrder && medicalRecord.nutritionOrder.rows) {
                medicalRecord.nutritionOrder.rows.map((item) => {
                    item.beginDate = item.beginDate && new Date(item.beginDate).formatTime('yyyy-MM-dd') || '';
                    item.gross = item.gross + (wx.jyApp.constData.unitChange[item.grossUnit] || '');
                });
            }
            if (medicalRecord.courseOfDisease && medicalRecord.courseOfDisease.rows) {
                medicalRecord.courseOfDisease.rows.map((item) => {
                    item.date = item.date && new Date(item.date).formatTime('yyyy-MM-dd') || '';
                });
            }
            this.setData({
                medicalRecord: medicalRecord
            });
        }
    }
})