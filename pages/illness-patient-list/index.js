const app = getApp()

Page({
    data: {
        patientList: [{
                id: 1,
                name: '李四',
                sex: '男',
                age: 18,
                height: 100,
                weight: 50
            },
            {
                id: 2,
                name: '张三',
                sex: '男',
                age: 18,
                height: 100,
                weight: 50
            }
        ],
        selectId: 0
    },
    onLoad(option) {
    	
    },
    selectPatient(e) {
    	var id = e.currentTarget.dataset.id;
    	this.setData({
    		selectId: id
    	});
    }
})