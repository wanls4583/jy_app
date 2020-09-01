import area from '../../../data/area.js';
Page({
    data: {
        searchText: '',
        searchTipVisible: false,
        orderByVisible: false,
        diseaseList: [],
        departmentList: [],
        stopRefresh: false,
        doctorList: [],
        page: 1,
        limit: 20,
        totalPage: -1,
        area: '全国',
        cityCode: '',
        _orderBy: '综合排序',
        orderBy: '',
        price: '',
        jobTitle: '',
        orderByList: [{
            label: '综合排序',
            value: ''
        }, {
            label: '回答次数最多',
            value: 1
        }, {
            label: '响应时间最快',
            value: 2
        }, {
            label: '价格从高到低',
            value: 3
        }, {
            label: '价格从低到高',
            value: 4
        }],
        areaList: [],
        areaVisible: false,
    },
    onLoad() {
        this.loadDiseaseList();
        this.loadDepartmentList();
        this.setData({
            areaList: area
        });
    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail
        });
    },
    onCancel() {
        this.setData({
            searchTipVisible: false
        });
    },
    onFocus() {
        this.setData({
            searchTipVisible: true
        });
    },
    onShowOrderBy() {
        this.setData({
            orderByVisible: !this.data.orderByVisible,
            areaVisible: false,
        });
    },
    onShowArea() {
        this.setData({
            areaVisible: !this.data.areaVisible,
            orderByVisible: false
        });
        if(!this.data.areaVisible) {
            this.onCancelArea();
        }
    },
    onClickOrderBy(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            orderByVisible: false,
            _orderBy: item.label,
            orderBy: item.value
        });
        this.loadList(true);
    },
    onClickTxt(e) {
        var txt = e.currentTarget.dataset.txt;
        this.setData({
            searchText: txt,
            searchTipVisible: false
        });
        this.complexName = txt;
        this.loadList(true);
    },
    onConfirmArea(e) {
        var arr = e.detail.values;
        var cityCode = arr[arr.length - 1].code;
        var area = arr[arr.length - 1].name;
        this.setData({
            areaVisible: false,
            cityCode: cityCode,
            area: area
        });
        this.loadList(true);
    },
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.cityCode);
        this.setData({
            areaVisible: false
        });
    },
    onSearch() {
        this.setData({
            searchTipVisible: false
        });
        this.complexName = this.data.searchText;
        this.loadList();
    },
    onRefresh() {
        this.loadList(true);
    },
    onLoadMore() {
        this.loadList();
    },
    onClickDoctor(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/interrogation/doctor-detail/index?id=' + id
        });
    },
    //获取科室列表
    loadDepartmentList() {
        wx.jyApp.http({
            url: '/department/list'
        }).then((data) => {
            this.setData({
                departmentList: data.list
            });
        })
    },
    //获取擅长列表
    loadDiseaseList() {
        wx.jyApp.http({
            url: '/sys/config/list',
            data: {
                configNames: 'goodAtDomain'
            }
        }).then((data) => {
            if (data.list.length) {
                this.setData({
                    diseaseList: data.list[0].goodAtDomain.split('#')
                });
            }
        })
    },
    loadList(refresh) {
        if (this.loading || !refresh && this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        if (refresh) {
            this.setData({
                doctorList: [],
                page: 1,
                limit: 10,
                totalPage: -1,
                stopRefresh: false,
            });
        }
        return wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: this.data.page,
                limit: this.data.limit,
                complexName: this.complexName || '',
                orderBy: this.data.orderBy,
                cityCode: this.data.cityCode
            }
        }).then((data) => {
            this.loading = false;
            data.page.list.map((item) => {

            });
            this.setData({
                'page': this.data.page + 1,
                'totalPage': data.page.totalPage,
                'doctorList': this.data.doctorList.concat(data.page.list)
            });
        }).finally(() => {
            this.loading = false;
            this.setData({
                stopRefresh: true
            });
        });
    }
})