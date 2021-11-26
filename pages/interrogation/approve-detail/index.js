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
            isAll: 0,
            titleGetDate: 0,
            titleCertificateDate: 0,
            startJobDate: 0,
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
    },
    onLoad(option) {
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['configData', 'doctorInfo'],
        });
        this.loadLoaclInfo();
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
        if (!this.checkEdit()) {
            return;
        }
        wx.jyApp.utils.setText({
            title: title,
            type: type || 'text',
            defaultValue: this.data[prop],
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
    onSave(e) {
        var status = e.currentTarget.dataset.status;
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
        })
    },
    loadLoaclInfo() {
        var data = wx.getStorageSync('approv-detail');
        if (data) {
            this.setInfo(data);
        }
    },
    setInfo(data) {
        data = Object.assign({}, data);
        data.jobCertificateUrl = data.jobCertificateUrl && data.jobCertificateUrl.split(',');
        data.jobTitleCertificateUrl = data.jobTitleCertificateUrl && data.jobTitleCertificateUrl.split(',');
        data._status = this.data.statusMap[data.status];
        data._authStatus = this.data.authStatusMap[data.authStatus];
        data._incomeSwitch = this.data.incomeSwitchMap[data.incomeSwitch];
        data.doctorAddition = data.doctorAddition || {};
        data.doctorAddition._titleGetDate = data.doctorAddition.titleGetDate;
        data.doctorAddition._titleCertificateDate = data.doctorAddition.titleCertificateDate;
        data.doctorAddition._startJobDate = data.doctorAddition.startJobDate;
        data.doctorAddition.titleGetDate = data.doctorAddition.titleGetDate || new Date().getTime();
        data.doctorAddition.titleCertificateDate = data.doctorAddition.titleCertificateDate || new Date().getTime();
        data.doctorAddition.startJobDate = data.doctorAddition.startJobDate || new Date().getTime();
        for (var key in data) {
            this.setData({
                [`${key}`]: data[key]
            });
        }
        console.log(data);
    },
    checkEdit() {
        return this.data.approveStatus == 1;
    }
})