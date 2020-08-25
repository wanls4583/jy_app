Page({
    data: {
        banner: [],
        currentBannerIndex: 0,
        productList: [],
        taocanList: [],
        departmentList: [{
            title: '科室1',
            descripiton: '科室介绍'
        }, {
            title: '科室1',
            descripiton: '科室介绍'
        }],
        doctorList: [{
        	name: '医生1',
        	zhiwei: '主任医师',
        	hospital: '金沙洲医院',
        	department: '营养科',
        	shanchang: '对对对、顶顶顶顶',
        	price: 30
        }],
        kepuList: [{
            title: '标题',
            picUrl: 'http://img.canteen.juyuanyingyang.com/upload/20200820/33d03e045d3a42fba2e133e87ec30de8.jpeg'
        }]
    },
    onLoad() {
        this.loadProduct();
        this.loadBaner();
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
    loadProduct() {
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: 1,
                limit: 6,
                type: 1
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item._goodsName = item.goodsName.length > 6 ? item.goodsName.slice(0, 6) + '...' : item.goodsName;
            });
            this.setData({
                taocanList: data.page.list
            });
        });
        wx.jyApp.http({
            url: '/goods/list',
            data: {
                page: 1,
                limit: 6,
                type: 2
            }
        }).then((data) => {
            data.page.list.map((item) => {
                item._goodsName = item.goodsName.length > 6 ? item.goodsName.slice(0, 6) + '...' : item.goodsName;
            });
            this.setData({
                productList: data.page.list
            });
        });
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
        var type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: `/pages/mall/product-list/index?type=${type}`
        });
    }
})