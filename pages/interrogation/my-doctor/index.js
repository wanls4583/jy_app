Page({
    data: {
        doctorList: []
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo', 'doctorInfo'],
        });
        this.storeBindings.updateStoreBindings();
        this.departmentId = option.departmentId; //患者聊天室科室医生列表
        this.share = option.share || ''; //分享筛查结果
        this.filtrateId = option.filtrateId;
        this.filtrateType = option.filtrateType;
        if (this.data.userInfo.viewVersion == 2) {
            this.viewVersion = 2
        }
        this.setData({
            viewVersion: this.viewVersion
        });
        this.loadList();
        if (option.title) {
            wx.setNavigationBarTitle({
                title: option.title
            });
        }
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onRefresh() {
        this.loadList();
    },
    onGoto(e) {
        if (!this.share) {
            wx.jyApp.utils.navigateTo(e);
        } else {
            this.gotoEvent = e;
        }
    },
    onShareResult(e) {
        var item = e.currentTarget.dataset.item;
        var title = this.filtrateType + '筛查';
        switch (this.filtrateType) {
            case 'TUNOUR_FLUID':
                title = '肿瘤恶质液评估';
                break;
            case 'ORAL_MUCOSA':
                title = '口腔黏膜风险评估';
                break;
            case 'X_INJURY':
                title = '放射性损伤评估';
                break;
            case 'FAT':
                title = '超重与肥胖筛查';
                break;
            case 'FAT-DISEASE':
                title = '疾病史';
                break;
            case 'FAT-DIET':
                title = '膳食调查';
                break;
            case 'FAT-SIT':
                title = '久坐行为调查';
                break;
            case 'FAT-SLEEP':
                title = '睡眠评估';
                break;
            case 'FAT-ACTION':
                title = '活动水平评估';
                break;
            case 'FAT-BODY':
                title = '体脂肪含量测量';
                break;
        }
        wx.jyApp.dialog.confirm({
            title: `分享给：${item.doctorName}`,
            message: `${title}结果`
        }).then(() => {
            wx.jyApp.http({
                url: '/patient/filtrate/share',
                method: 'post',
                data: {
                    id: this.filtrateId - 0,
                    doctorId: item.id
                }
            }).then((data) => {
                wx.jyApp.utils.navigateBack({
                    success: () => {
                        wx.jyApp.utils.navigateTo(this.gotoEvent);
                    }
                })
            });
        })
    },
    //加载医生列表
    loadList() {
        if (this.loading) {
            return;
        }
        var url = this.viewVersion == 2 ? '/hospital/department/user/doctor' : '/wx/user/doctor';
        if (this.departmentId) { //科室医生
            url = '/hospital/department/doctor';
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: url,
            data: {
                departmentId: this.departmentId
            }
        });
        this.request.then((data) => {
            this.setData({
                'doctorList': data.list || []
            });
        }).finally(() => {
            this.loading = false;
            this.request = null;
            this.setData({
                stopRefresh: true
            });
        });
        return this.request;
    }
})