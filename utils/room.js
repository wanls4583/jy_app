/*
 * @Author: lisong
 * @Date: 2020-12-08 14:27:39
 * @Description: 
 */
function getRoomInfo(userId) {
    return wx.jyApp.http({
        url: '/rooInfo',
        data: {
            userId: userId
        }
    });
}

function setRoomInfo(userId, data) {
    return wx.jyApp.http({
        url: '/rooInfo',
        data: {
            userId: userId,
            data: data
        }
    });
}


function invite(option) {
    var data = {
        type: 'invite',
        user: option.user,
        roomId: option.roomId
    }
    return setRoomInfo(option.receiver, data);
}

function cancel(option) {
    var data = {
        type: 'cancel',
        user: option.user,
        roomId: option.roomId
    }
    return setRoomInfo(option.receiver, data);
}

function refuse(option) {
    var data = {
        type: 'refuse',
        user: option.user,
        roomId: option.roomId
    }
    return setRoomInfo(option.receiver, data);
}

module.exports = {
    getRoomInfo: getRoomInfo,
    setRoomInfo: setRoomInfo,
    invite: invite,
    cancel: cancel,
    refuse: refuse,
}