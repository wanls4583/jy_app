/*
 * @Author: lisong
 * @Date: 2020-09-05 22:52:49
 * @Description: 
 */
Page({
    data: {
        active: 0,
        fatData: [],
        answersMap: {
            'FAT-GROW': [{
                1: '正常',
                2: '低出生体质量',
                3: '巨大儿'
            }, {
                1: '纯母乳喂养小于6个月',
                2: '纯母乳喂养至满6个月',
                3: '纯母乳喂养达1岁',
                4: '母乳喂养达2岁',
                5: '奶粉（人工）喂养（无母乳喂养）'
            }, {
                1: '足月',
                2: '早产'
            }, {
                1: '提前',
                2: '正常',
                3: '延迟'
            }, {
                1: '小于4个月',
                2: '小于6个月',
                3: '满6个月开始',
                4: '大于6个月开始'
            }],
            'FAT-HOME': [{
                1: '家族成员中有超重或肥胖史'
            }, {
                1: '家族成员中有超重或肥胖相关疾病情况'
            }, {
                1: '家族成员中有继发性超重或肥胖病史'
            }],
            'FAT-DISEASE': [{
                    1: '5岁前开始肥胖或快速发展，尤其是与遗传相关的情况（认知发育延迟、畸形等）。',
                    2: '持续或快速的体重增加与降低的生长速度或身材矮小相关。',
                    3: '使用导致食欲亢进的药物（即皮质类固醇、兵戎酸钠、利培酮、吩噻嗪、环丙他定）。',
                    4: '黑棘皮病、紫纹、眼睑水肿等。',
                    5: '男生乳房发育、女生月经缭乱、多毛',
                },
                {
                    1: '脂肪肝',
                    2: '高血压',
                    3: '高血脂',
                    4: '高尿酸',
                    5: '睡眠呼吸暂停综合征',
                    6: '食欲异常亢进',
                }
            ]
        }
    },
    onLoad(option) {
        this.from = option.from || '';
        this.setData({
            active: option.active || 0,
            doctorId: option.doctorId || '',
            doctorName: option.doctorName || '',
            consultOrderId: option.consultOrderId || '',
            patientId: option.patientId || ''
        });
        var patient = wx.jyApp.getTempData('screenPatient') || {};
        this.patientId = patient.id;
        if (option.active == 1) {
            this.getInfo();
        }
    },
    onSwitch(e) {
        var active = typeof e == 'number' ? e : e.currentTarget.dataset.active;
        this.setData({
            active: active
        });
        if (active == 0) {
            wx.setNavigationBarTitle({
                title: '超重与肥胖评估'
            });
        } else {
            wx.setNavigationBarTitle({
                title: '减重报告'
            });
        }
        this.getInfo();
    },
    switchTab(active) {
        this.onSwitch(active);
    },
    onFatCollapseChange(e) {
        this.setData({
            fatActiveNames: e.detail,
        });
    },
    onGoto(e) {
        var url = e.currentTarget.dataset.url;
        url = url + `?from=${this.from}&consultOrderId=${this.data.consultOrderId}&patientId=${this.data.patientId}`;
        wx.jyApp.utils.navigateTo({
            url: url
        });
    },
    getInfo() {
        wx.jyApp.http({
            url: `/patientdocument/detail/${this.patientId}`
        }).then((data) => {
            data.filtrate = data.filtrate || [];
            data.fatFiltrate = data.filtrate.filter((item) => {
                return item.filtrateType.slice(0, 4) == 'FAT-';
            });
            data.filtrate = data.filtrate.filter((item) => {
                return item.filtrateType.slice(0, 4) != 'FAT-';
            });
            var fatTypes = [];
            var fatData = [];
            var fatActiveNames = [];
            data.fatFiltrate.map((item, index) => {
                item.visible = true;
                item.answers = item.answers && JSON.parse(item.answers) || {};
                item.resultDescription = item.resultDescription && item.resultDescription.split(';') || [];
                if (fatTypes.indexOf(item.filtrateType) == -1) {
                    fatTypes.push(item.filtrateType);
                }
                if (item.filtrateType == 'FAT-GROW') {
                    item._filtrateType = '出生、喂养史、发育史';
                    if (!item.answers.q || !item.answers.q.length) {
                        item.visible = false;
                    } else {
                        var q = [];
                        item.answers.q.map((_item, i) => {
                            if (i == 5) {
                                if (_item == 1) {
                                    q.push('孩子' + item.answers.age + '岁开始体重增长过快或感觉明显高于同性别的同龄人');
                                } else {
                                    q.push('无上述情况');
                                }
                            } else {
                                _item = _item && this.data.answersMap['FAT-GROW'][i][_item] || '';
                                q.push(_item);
                            }
                        });
                        item.answers.q = q;
                    }
                }
                if (item.filtrateType == 'FAT-HOME') {
                    item._filtrateType = '家族史';
                    if (!item.answers.q || item.answers.q.indexOf(1) == -1) {
                        item.visible = false;
                    } else {
                        var q = [];
                        item.answers.q.map((_item, i) => {
                            if (_item == 1) {
                                q.push(this.data.answersMap['FAT-HOME'][i][_item]);
                            }
                        });
                        item.answers.q = q;
                    }
                }
                if (item.filtrateType == 'FAT-DISEASE') {
                    item._filtrateType = '疾病史';
                    item.visible = false;
                    if (item.answers.q && item.answers.q.length &&
                        (item.answers.q[0] && item.answers.q[0].length && String(item.answers.q[0]) != 6 ||
                            item.answers.q[1] && item.answers.q[1].length && String(item.answers.q[1]) != 7)) {
                        item.visible = true;
                        var q = [];
                        item.answers.q.map((_item, i) => {
                            if (_item) {
                                var arr = [];
                                _item.map((obj, _i) => {
                                    var ansewer = this.data.answersMap['FAT-DISEASE'][i];
                                    ansewer = ansewer && ansewer[obj] || '';
                                    ansewer && arr.push(ansewer);
                                });
                                arr.length && q.push(arr);
                            }
                        });
                        item.answers.q = q;
                        item.answers.q[1] = item.answers.q[1] && item.answers.q[1].join('、');
                    }
                }
                if (item.filtrateType == 'FAT-TREAT') {
                    item._filtrateType = '肥胖治疗史';
                }
                if (item.filtrateType == 'FAT-DIET') {
                    item._filtrateType = '膳食调查'
                }
                if (item.filtrateType == 'FAT-SIT') {
                    item._filtrateType = '久坐行为调查'
                }
                if (item.filtrateType == 'FAT-SLEEP') {
                    item._filtrateType = '睡眠评估'
                }
                if (item.filtrateType == 'FAT-ACTION') {
                    item._filtrateType = '身体活动水平评估'
                }
                if (item.filtrateType == 'FAT-BODY') {
                    item._filtrateType = '体脂肪含量测量'
                }
                if (item.visible) {
                    item.activeName = index;
                    fatActiveNames.push(index);
                }
            });
            fatTypes.map((item) => {
                fatData = fatData.concat(data.fatFiltrate.filter((_item) => {
                    return _item.filtrateType == item;
                }));
            });
            this.setData({
                fatData: fatData,
                fatActiveNames: fatActiveNames
            });
        }).catch((e)=>{
            console.log(e);
        });
    },
})