import area from '../../../data/area.js';
Page({
    data: {
        searchText: '',
        searchTipVisible: true,
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
        priceList: [{
            label: '1-30',
            value: 1
        }, {
            label: '30-50',
            value: 2
        }, {
            label: '50-100',
            value: 3
        }, {
            label: '100以上',
            value: 4
        }],
        positionList: ['营养师', '主任医师', '副主任医师', '主治医师', '医师'],
        areaList: [],
        areaVisible: false,
        screenVisible: false
    },
    onLoad(option) {
        this.jobTitle = ''; //职称搜索条件
        this.price = ''; //价格搜索条件
        this.loadDiseaseList();
        this.loadDepartmentList();
        this.setData({
            areaList: area,
            searchText: option.departmentName || '',
            searchTipVisible: !option.departmentName
        });
        this.complexName = option.departmentName || ''
        this.loadList();
    },
    onShow() {

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
    //显示排序
    onShowOrderBy() {
        this.setData({
            orderByVisible: !this.data.orderByVisible,
            areaVisible: false,
            screenVisible: false
        });
        this.onCancelArea();
        this.onCancelScreen();
    },
    //显示地区选择
    onShowArea() {
        this.setData({
            areaVisible: !this.data.areaVisible,
            orderByVisible: false,
            screenVisible: false
        });
        if (!this.data.areaVisible) {
            this.onCancelArea();
        }
        this.onCancelScreen();
    },
    //取消地区选择
    onCancelArea() {
        this.selectComponent('#area').reset(this.data.cityCode);
        this.setData({
            areaVisible: false
        });
    },
    //显示筛选
    onShowScreen() {
        this.setData({
            screenVisible: !this.data.screenVisible,
            orderByVisible: false,
            areaVisible: false
        });
        if (!this.data.screenVisible) {
            this.onCancelScreen();
        }
        this.onCancelArea();
    },
    //取消隐藏筛选
    onCancelScreen() {
        this.setData({
            screenVisible: false,
            jobTitle: this.jobTitle || '',
            price: this.price || ''
        });
    },
    //选中排序
    onClickOrderBy(e) {
        var item = e.currentTarget.dataset.item;
        this.setData({
            orderByVisible: false,
            _orderBy: item.label,
            orderBy: item.value
        });
        this.loadList(true);
    },
    //选中提示搜索文案
    onClickTxt(e) {
        var txt = e.currentTarget.dataset.txt;
        this.setData({
            searchText: txt,
            searchTipVisible: false
        });
        this.complexName = txt;
        this.loadList(true);
    },
    //选中地区
    onConfirmArea(e) {
        var arr = e.detail.values;
        var city = arr[arr.length - 1];
        var cityCode = city && city.code || '';
        var area = city && city.name || '全国';
        this.setData({
            areaVisible: false,
            cityCode: cityCode,
            area: area
        });
        this.loadList(true);
    },
    //选中职称
    onClickPosition(e) {
        var index = e.currentTarget.dataset.index;
        var position = this.data.positionList[index];
        this.setData({
            jobTitle: position == this.data.jobTitle ? '' : position
        });
    },
    //选中价格
    onClickPrice(e) {
        var index = e.currentTarget.dataset.index;
        var price = this.data.priceList[index];
        this.setData({
            price: price.value == this.data.price ? '' : price.value
        });
    },
    //确认筛选
    onConfirmScreen() {
        this.jobTitle = this.data.jobTitle || '';
        this.price = this.data.price || '';
        this.loadList(true);
        this.setData({
            screenVisible: false
        });
    },
    onSearch() {
        this.setData({
            searchTipVisible: false
        });
        this.complexName = this.data.searchText;
        this.loadList(true);
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
    //加载医生列表
    loadList(refresh) {
        if (refresh) {
            this.setData({
                doctorList: [],
                page: 1,
                limit: 10,
                totalPage: -1,
                stopRefresh: false,
            });
            this.request && this.request.requestTask.abort();
        } else if (this.loading || this.data.totalPage > -1 && this.data.page > this.data.totalPage) {
            return;
        }
        this.loading = true;
        this.request = wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: this.data.page,
                limit: this.data.limit,
                complexName: this.complexName || '',
                orderBy: this.data.orderBy,
                cityCode: this.data.cityCode,
                jobTitle: this.jobTitle,
                price: this.price
            }
        });
        this.request.then((data) => {
            this.setData({
                'page': this.data.page + 1,
                'totalPage': data.page.totalPage,
                'doctorList': this.data.doctorList.concat(data.page.list || [])
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