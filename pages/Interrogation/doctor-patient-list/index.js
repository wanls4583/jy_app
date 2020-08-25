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
        ]
    },
    onLoad(option) {
    	this.loadList();
    },
    onClickPatient(e) {
    	var id = e.currentTarget.dataset.id;
    },
    onGotoSearch() {

    },
    loadList() {
        wx.jyApp.http({
            url: '/patientdocument/list'
        }).then((data)=>{
            console.log(data)
        });
    }
})