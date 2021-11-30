Page({
    data: {
        id: '',
        doctorAddition: {
            titleCategoryName: '',
            titleCertificateNumber: '',
            jobCertificateNumber: '',
            jobAddress: '',
            jobDomain: '',
            _jobDomain: '',
            jobDepartmentCode: '',
            isAll: null,
            titleGetDate: '',
            titleCertificateDate: '',
            startJobDate: '',
            _titleGetDate: '',
            _titleCertificateDate: '',
            _startJobDate: '',
        },
        avatar: '',
        jobCertificateUrl: [],
        jobTitleCertificateUrl: [],
        phone: '',
        activeNames: ['1', '2', '3', '4'],
        doctorName: '',
        idNumber: '',
        introduce: '',
        goodAtDomain: '',
        workDepartmentName: '',
        onlineDepartmentName: '',
        workHospitalName: '',
        jobTitle: '',
        cityCode: '',
        provinceCity: '',
        approveStatus: 1,
        approveMsg: '',
        showable: 0,
        titleGetDateVisible: false,
        titleCertificateDateVisible: false,
        startJobDateVisible: false,
        departmentVisible: false,
        isSpecialTitle: false,
        workDepartmentList: [],
        authStatusMap: {
            2: '资料待完善',
            1: '已认证',
            0: '未认证'
        },
        statusMap: {
            1: '上线',
            2: '下线',
            3: '禁用',
        },
        incomeSwitchMap: {
            0: '关闭',
            1: '开启',
        },
        approveStatusMap: {
            1: '审核中',
            2: '审核通过',
            3: '审核不通过',
        }
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'doctorInfo'],
        });
        // this.loadLoaclInfo();
        this.loadInfo(option.id);
        this.loadWorkDepartmentList();
        this.storeBindings.updateStoreBindings();
    },
    onHide() {
        this.storeBindings.destroyStoreBindings();
    },
    onUnload() {},
    onInput(e) {
        var prop = e.currentTarget.dataset.prop;
        var type = e.currentTarget.dataset.type;
        var title = e.currentTarget.dataset.title;
        var defaultValue = undefined;
        var props = prop.split('.');
        props.map((item) => {
            defaultValue = defaultValue == undefined ? this.data[item] : defaultValue[item];
        });
        if (!this.checkEdit()) {
            return;
        }
        wx.jyApp.utils.setText({
            title: title,
            type: type || 'text',
            defaultValue: defaultValue,
            complete: (value) => {
                this.setData({
                    [prop]: value
                });
            }
        });
    },
    onChange(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}`]: e.detail,
        });
    },
    onCollapseChange(event) {
        this.setData({
            activeNames: event.detail,
        });
    },
    onConfirmDate(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}Visible`]: false,
            [`doctorAddition.${prop}`]: e.detail,
            [`doctorAddition._${prop}`]: new Date(e.detail).formatTime('yyyy-MM-dd'),
        })
    },
    onShowDate(e) {
        if (!this.checkEdit()) {
            return;
        }
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}Visible`]: true,
        })
    },
    onCancelDate(e) {
        var prop = e.currentTarget.dataset.prop;
        this.setData({
            [`${prop}Visible`]: false,
        })
    },
    onShowDepartment() {
        if (!this.checkEdit()) {
            return;
        }
        this.setData({
            departmentVisible: !this.data.departmentVisible
        });
    },
    onConfirmDepartment(e) {
        this.setData({
            'doctorAddition._jobDomain': e.detail.value.departmentName,
            'doctorAddition.jobDomain': e.detail.value.departmentCode,
            departmentVisible: false
        });
    },
    onClickImg(e) {
        var src = e.currentTarget.dataset.src;
        var urls = e.currentTarget.dataset.urls;
        wx.previewImage({
            current: src,
            urls: urls
        });
    },
    onSave(e) {
        var status = e.currentTarget.dataset.status;
        if (this.showable == 1 && !this.data.doctorAddition.titleCategoryName) {
            wx.jyApp.toast('资质类别名称为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition.titleCertificateNumber) {
            wx.jyApp.toast('资格证书编号不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition._titleGetDate) {
            wx.jyApp.toast('资格获得时间不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition.titleCertificateNumber && this.data.isSpecialTitle) {
            wx.jyApp.toast('执业证书编号不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition._titleCertificateDate && this.data.isSpecialTitle) {
            wx.jyApp.toast('发证日期不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition.jobAddress && this.data.isSpecialTitle) {
            wx.jyApp.toast('执业地点不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition._jobDomain && this.data.isSpecialTitle) {
            wx.jyApp.toast('执业范围不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition.jobDepartmentCode) {
            wx.jyApp.toast('主要执业医疗机构代码不能为空');
            return;
        }
        if (this.showable == 1 && !this.data.doctorAddition._startJobDate) {
            wx.jyApp.toast('参加工作日期不能为空');
            return;
        }
        if (!this.data.approveMsg) {
            wx.jyApp.toast('审核说明不能为空');
            return;
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        wx.jyApp.http({
            url: '/doctor/approve/exec',
            method: 'post',
            data: {
                id: this.data.id,
                doctorAddition: {
                    titleCategoryName: this.data.doctorAddition.titleCategoryName,
                    titleCertificateNumber: this.data.doctorAddition.titleCertificateNumber,
                    jobCertificateNumber: this.data.doctorAddition.jobCertificateNumber,
                    jobAddress: this.data.doctorAddition.jobAddress,
                    jobDomain: this.data.doctorAddition.jobDomain,
                    jobDepartmentCode: this.data.doctorAddition.jobDepartmentCode,
                    isAll: this.data.doctorAddition.isAll,
                    titleGetDate: this.data.doctorAddition._titleGetDate,
                    titleCertificateDate: this.data.doctorAddition._titleCertificateDate,
                    startJobDate: this.data.doctorAddition._startJobDate,
                },
                status: status,
                msg: this.data.approveMsg,
                showable: this.data.showable
            }
        }).then(() => {
            var page = wx.jyApp.utils.getPages('pages/interrogation/approve-history/index');
            if (page) {
                page.loadList(true);
            }
            wx.jyApp.toastBack('提交成功');
        }).catch(() => {
            wx.hideLoading();
        });
    },
    //加载科室列表
    loadWorkDepartmentList() {
        wx.jyApp.http({
            url: '/department/list2'
        }).then((data) => {
            this.setData({
                workDepartmentList: data.list
            });
            this.setJobDomain();
        })
    },
    loadLoaclInfo() {
        var data = wx.getStorageSync('approv-detail');
        if (data) {
            this.setInfo(data);
        }
    },
    loadInfo(id) {
        wx.jyApp.http({
            url: `/doctor/approve/history/info/${id}`
        }).then((data) => {
            data.doctorApproveHistory.incomeSwitch = data.incomeSwitch;
            data.doctorApproveHistory.status = data.status;
            this.setInfo(data.doctorApproveHistory);
        });
    },
    setInfo(data) {
        data = Object.assign({}, data);
        data.jobCertificateUrl = data.jobCertificateUrl && data.jobCertificateUrl.split(',');
        data.jobTitleCertificateUrl = data.jobTitleCertificateUrl && data.jobTitleCertificateUrl.split(',');
        data._status = this.data.statusMap[data.status];
        data._approveStatus = this.data.approveStatusMap[data.approveStatus];
        data._authStatus = this.data.authStatusMap[data.authStatus];
        data._incomeSwitch = this.data.incomeSwitchMap[data.incomeSwitch];
        data.doctorAddition = data.doctorAddition || this.data.doctorAddition;
        data.doctorAddition._titleGetDate = data.doctorAddition.titleGetDate;
        data.doctorAddition._titleCertificateDate = data.doctorAddition.titleCertificateDate;
        data.doctorAddition._startJobDate = data.doctorAddition.startJobDate;
        data.doctorAddition.titleGetDate = data.doctorAddition.titleGetDate && Date.prototype.parseDate(data.doctorAddition.titleGetDate).getTime() || new Date().getTime();
        data.doctorAddition.titleCertificateDate = data.doctorAddition.titleCertificateDate && Date.prototype.parseDate(data.doctorAddition.titleCertificateDate).getTime() || new Date().getTime();
        data.doctorAddition.startJobDate = data.doctorAddition.startJobDate && Date.prototype.parseDate(data.doctorAddition.startJobDate).getTime() || new Date().getTime();
        data.isSpecialTitle = ['主任医师', '副主任医师', '主治医师', '医师'].indexOf(data.jobTitle) > -1;
        for (var key in data) {
            this.setData({
                [`${key}`]: data[key]
            });
        }
        this.setJobDomain();
        console.log(data);
    },
    setJobDomain() {
        if (this.data.doctorAddition.jobDomain) {
            this.data.workDepartmentList.map((item) => {
                if (item.departmentCode == this.data.doctorAddition.jobDomain) {
                    this.setData({
                        'doctorAddition._jobDomain': item.departmentName
                    });
                }
            });
        }
    },
    checkEdit() {
        return this.data.approveStatus == 1;
    }
})