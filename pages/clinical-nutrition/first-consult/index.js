/*
 * @Author: lisong
 * @Date: 2021-01-27 16:08:59
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
                        this.loadInfo();
                    });
                }
            }
        }
    },
    data: {
        consult: {
            id: '',
            consultedDate: '',
            doctorName: '',
            stature: '',
            weight: '',
            stomachSymptom_select: [],
            stomachSymptom_day: '',
            stomachSymptom_xingzhuang: '',
            stomachSymptom_count1: '',
            stomachSymptom_count2: '',
            stomachSymptom_ml1: '',
            stomachSymptom_ml2: '',
            pathway: '',
            useNum_count: '',
            useNum_ml: '',
            useNum_density: '',
            bumpRate: '',
            category_select: [],
            category_input1: '',
            category_input2: '',
            category_input3: '',
            category_input4: '',
            category_input5: '',
            category_input6: '',
            category_input7: '',
            diagnosis1: '',
            diagnosis2: '',
            diagnosis3: '',
            diagnosis4: '',
            diagnosis5: '',
            zongdanbai: '',
            baidanbai: '',
            alt: '',
            ast: '',
            zongdanhonggsu: '',
            zhijiedanhongsu: '',
            jianjiedanhongsu: '',
            tanghuaxuehongdanbai: '',
            xuehongdanbai: '',
            xuexiaoban: '',
            xuexibao: '',
            baoxibao: '',
            jigan: '',
            niaosu: '',
            ca: '',
            xuetang: '',
            aminoAcid_num: '',
            aminoAcid_way: '',
            fat_num: '',
            fat_way: '',
            glucose_num: '',
            glucose_way: '',
        },
        consultedDate: new Date().getTime(),
        dateVisible: false
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
        onInput(e) {
            wx.jyApp.utils.onInput(e, this);
        },
        onChange(e) {
            var prop = e.currentTarget.dataset.prop;
            this.setData({
                [`${prop}`]: e.detail,
            });
        },
        onShowDate() {
            this.setData({
                dateVisible: true
            });
        },
        onConfirmDate(e) {
            var consultedDate = new Date(e.detail).formatTime('yyyy-MM-dd');
            this.setData({
                'nrs.consultedDate': consultedDate,
                dateVisible: false
            });
        },
        onCancelDate() {
            this.setData({
                dateVisible: false
            });
        },
        loadInfo() {
            return wx.jyApp.http({
                type: 'mobile',
                url: '/app/nutrition/query',
                data: {
                    method: 'consultFirst',
                    inHospitalNumber: this.properties.patient.inHospitalNumber,
                    isInpatient: this.properties.patient.isInpatient
                }
            }).then((data) => {
                data = data.result;
                this.setInfo(data);
            });
        },
        setInfo(consult) {
            var data = Object.assign({}, consult);
            var stomachSymptom = JSON.parse(data.stomachSymptom);
            var useNum = JSON.parse(data.useNum);
            var category = JSON.parse(data.category);
            var checkResult = JSON.parse(data.checkResult);
            var aminoAcid = JSON.parse(data.aminoAcid);
            var fat = JSON.parse(data.fat);
            var glucose = JSON.parse(data.glucose);
            for (var key in stomachSymptom) {
                data[key] = stomachSymptom[key];
            }
            for (var key in useNum) {
                data[key] = useNum[key];
            }
            for (var key in category) {
                data[key] = category[key];
            }
            for (var key in checkResult) {
                data[key] = checkResult[key];
            }
            for (var key in aminoAcid) {
                data[key] = aminoAcid[key];
            }
            for (var key in fat) {
                data[key] = fat[key];
            }
            for (var key in glucose) {
                data[key] = glucose[key];
            }
            data.consultedDate = consult.consultedDate && new Date(consult.consultedDate).formatTime('yyyy-MM-dd') || '';
            data.pathway = JSON.parse(data.pathway);
            this.setData({
                consult: data,
                consultedDate: consult.consultedDate
            });
        },
        getSaveData() {
            var data = {
                ...this.data.consult,
                inHospitalNumber: this.properties.patient.inHospitalNumber,
                isInpatient: this.properties.patient.isInpatient,
            }
            data.pathway = JSON.stringify(data.pathway) || '[]';
            data.stomachSymptom = JSON.stringify({
                stomachSymptom_select: data.stomachSymptom_select,
                stomachSymptom_day: data.stomachSymptom_day,
                stomachSymptom_count1: data.stomachSymptom_count1,
                stomachSymptom_count2: data.stomachSymptom_count2,
                stomachSymptom_ml1: data.stomachSymptom_ml1,
                stomachSymptom_ml2: data.stomachSymptom_ml2,
                stomachSymptom_xingzhuang: data.stomachSymptom_xingzhuang
            });
            data.useNum = JSON.stringify({
                useNum_count: data.useNum_count,
                useNum_ml: data.useNum_ml,
                useNum_density: data.useNum_density
            });
            data.category = JSON.stringify({
                category_select: data.category_select,
                category_input1: data.category_input1,
                category_input2: data.category_input2,
                category_input3: data.category_input3,
                category_input4: data.category_input4,
                category_input5: data.category_input5,
                category_input6: data.category_input6,
                category_input7: data.category_input7
            });
            data.checkResult = JSON.stringify({
                zongdanbai: data.zongdanbai,
                baidanbai: data.baidanbai,
                alt: data.alt,
                ast: data.ast,
                zongdanhonggsu: data.zongdanhonggsu,
                zhijiedanhongsu: data.zhijiedanhongsu,
                jianjiedanhongsu: data.jianjiedanhongsu,
                tanghuaxuehongdanbai: data.tanghuaxuehongdanbai,
                xuehongdanbai: data.xuehongdanbai,
                xuexiaoban: data.xuexiaoban,
                xuexibao: data.xuexibao,
                baoxibao: data.baoxibao,
                jigan: data.jigan,
                niaosu: data.niaosu,
                niaosuan: data.niaosuan,
                ca: data.ca,
                xuetang: data.xuetang
            });
            data.aminoAcid = JSON.stringify({
                aminoAcid_num: data.aminoAcid_num,
                aminoAcid_way: data.aminoAcid_way
            });
            data.fat = JSON.stringify({
                fat_num: data.fat_num,
                fat_way: data.fat_way
            });
            data.glucose = JSON.stringify({
                glucose_num: data.glucose_num,
                glucose_way: data.glucose_way
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
                        method: 'consultFirst',
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