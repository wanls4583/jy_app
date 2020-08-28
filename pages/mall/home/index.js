Page({
    data: {
        banner: [],
        currentBannerIndex: 0,
        productList: [],
        taocanList: [],
        departmentList: [],
        doctorList: [],
        kepuList: [{
            title: '标题',
            picUrl: 'http://img.canteen.juyuanyingyang.com/upload/20200820/33d03e045d3a42fba2e133e87ec30de8.jpeg'
        }]
    },
    onLoad() {
        this.loadBaner();
        this.loadDoctor();
        this.loadDepartmentList();
    },
    onGotoSearch() {
        wx.navigateTo({
            url: '/pages/mall/search/index?showDoctor=1'
        });
    },
    bannerChang(e) {
        this.setData({
            currentBannerIndex: e.detail.current
        });
    },
    loadDoctor() {
        wx.jyApp.http({
            url: '/doctor/list',
            data: {
                page: 1,
                limit: 3
            }
        }).then((data)=>{
            this.setData({
                doctorList: data.page.list
            });
        })
    },
    loadDepartmentList() {
        wx.jyApp.http({
            url: '/department/list'
        }).then((data)=>{
            this.setData({
                departmentList: data.list
            });
        })
    },
    loadBaner() {
        wx.jyApp.http({
            url: '/banner/list',
            data: {
                bannerCode: '0001'
            }
        }).then((data) => {
            this.setData({
                banner: data.list
            });
        });
    },
    onclickProdcut(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/mall/product-detail/index?id=' + id
        });
    },
    onClickBanner(e) {
        var link = e.currentTarget.dataset.link;
    },
    //查看更多
    onClickMore(e) {
        
    }
})