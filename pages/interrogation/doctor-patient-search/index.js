Page({
    data: {
        patientList: [{
                id: 1,
                name: '李四',
                sex: '男',
                age: 18,
                height: 100,
                weight: 50,
                avater: '',
                creatTime: '2020-8-6 9:11'
            },
            {
                id: 2,
                name: '张三',
                sex: '男',
                age: 18,
                height: 100,
                weight: 50,
                avater: '',
                creatTime: '2020-8-6 9:11'
            }
        ],
        page: 2,
        totalPage: 1,
        stopRefresh: false,
        patientName: '',
        searchText: ''
    },
    onLoad(option) {
    },
    onClickPatient(e) {
    	var id = e.currentTarget.dataset.id;
    },
    onSearch() {
        this.setData({
            patientName: this.data.searchText
        });
        this.search();
    },
    onChangeText(e) {
        this.setData({
            searchText: e.detail
        });
    },
    onRefresh() {

    },
    onLoadMore() {

    },
    search() {
        wx.jyApp.http({
            url: '/patientdocument/list'
        }).then((data)=>{
            console.log(data)
        });
    }
})