/*
 * @Author: lisong
 * @Date: 2020-11-02 15:12:40
 * @Description: 
 */
Page({
    data: {
        'color': '#999',
        'selectedColor': '#2aafff',
        'borderStyle': 'black',
        'backgroundColor': '#fff',
        'list': [{
                'id': 'user-home',
                'pagePath': '/pages/mall/home/index',
                'iconPath': '/image/icon_home.png',
                'selectedIconPath': '/image/icon_home_active.png',
                'text': '首页'
            },
            {
                'id': 'user-mall',
                'pagePath': '/pages/mall/mall/index',
                'iconPath': '/image/icon_marks.png',
                'selectedIconPath': '/image/icon_marks_active.png',
                'text': '制剂中心'
            },
            {
                'id': 'message-list',
                'pagePath': '/pages/interrogation/message-list/index',
                'iconPath': '/image/icon_message.png',
                'selectedIconPath': '/image/icon_message_active.png',
                'text': '消息'
            },
            {
                'id': 'mine',
                'pagePath': '/pages/mine/index',
                'iconPath': '/image/icon_center.png',
                'selectedIconPath': '/image/icon_center_active.png',
                'text': '我的'
            }
        ],
        doctorTabList: [{
                'id': 'doctor-home',
                'pagePath': '/pages/interrogation/home/index',
                'iconPath': '/image/icon_home.png',
                'selectedIconPath': '/image/icon_home_active.png',
                'text': '首页',
            },
            {
                'id': 'patient-manage',
                'pagePath': '/pages/interrogation/doctor-patient-list/index',
                'iconPath': '/image/icon_users.png',
                'selectedIconPath': '/image/icon_users_active.png',
                'text': '患者管理',
            },
            {
                'id': 'message-list',
                'pagePath': '/pages/interrogation/message-list/index',
                'iconPath': '/image/icon_message.png',
                'selectedIconPath': '/image/icon_message_active.png',
                'text': '消息'
            },
            {
                'id': 'mine',
                'pagePath': '/pages/mine/index',
                'iconPath': '/image/icon_center.png',
                'selectedIconPath': '/image/icon_center_active.png',
                'text': '我的'
            }
        ],
        pagePath: '',
        loadedPathMap: {}
    },
    onLoad(option) {
        var pagePath = '/pages/mall/home/index';
        var list = this.data.list;
        this.storeBindings = wx.jyApp.createStoreBindings(this, {
            store: wx.jyApp.store,
            fields: ['userInfo']
        });
        this.storeBindings.updateStoreBindings();
        if (option.url) {
            pagePath = option.url;
            pagePath = pagePath.slice(0, pagePath.indexOf('?') || Infinity);
            pagePath = pagePath.slice(0, pagePath.indexOf('#') || Infinity);
        } else if (this.data.userInfo.role == 'DOCTOR') {
            pagePath = '/pages/interrogation/home/index';
        }
        if (this.data.userInfo.role == 'DOCTOR') {
            list = this.data.doctorTabList;
        } else if (this.data.userInfo.viewVersion == 2) {
            list.splice(1, 1);
        }
        this.data.loadedPathMap[pagePath] = true;
        list.map((item) => {
            if (item.pagePath == pagePath) {
                this.comId = item.id;
            }
        });
        this.setData({
            pagePath: pagePath,
            list: list,
            loadedPathMap: this.data.loadedPathMap
        });
    },
    onShow() {
        var com = this.selectComponent('#' + this.comId);
        com.onShow && com.onShow();
        wx.hideHomeButton();
    },
    onHide() {
        var com = this.selectComponent('#' + this.comId);
        com.onHide && com.onHide();
    },
    onUnload() {
        this.storeBindings.destroyStoreBindings();
    },
    onShareAppMessage: function (res) {
        return {
            title: '钜元营养',
            path: '/pages/index/index',
            imageUrl: '/image/logo.png'
        }
    },
    onSwitchTab(e) {
        var prePath = this.data.pagePath;
        var preComId = this.comId;
        var path = e.currentTarget.dataset.path;
        var comId = e.currentTarget.dataset.id;
        if (prePath == path) {
            return;
        }
        this.data.loadedPathMap[path] = true;
        this.setData({
            pagePath: path,
            loadedPathMap: this.data.loadedPathMap
        });
        this.comId = comId;
        wx.nextTick(() => {
            var com = this.selectComponent('#' + preComId);
            com.onHide && com.onHide();
            com = this.selectComponent('#' + comId);
            com.onShow && com.onShow();
        });
    }
})