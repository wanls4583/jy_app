Component({
    options: {
        styleIsolation: 'shared'
    },
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
    lifetimes: {
        attached(option) {
            this.loadList();
        }
    },
    methods: {
        onClickPatient(e) {
            var id = e.currentTarget.dataset.id;
        },
        onGotoSearch() {
            wx.navigateTo({
                url: '/pages/interrogation/doctor-patient-search/index'
            });
        },
        loadList() {
            wx.jyApp.http({
                url: '/doctor/patients'
            }).then((data) => {
                console.log(data)
            });
        }
    }
})