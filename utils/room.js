/*
 * @Author: lisong
 * @Date: 2020-12-08 14:27:39
 * @Description: 
 */
function getRoomInfo() {
    return wx.jyApp.http({
        url: '/wx/trtc/query/data'
    });
}

function setRoomInfo(data) {
    return wx.jyApp.http({
        url: '/wx/trtc/report',
        method: 'post',
        data: {
            consultOrderId: data.consultOrderId,
            status: data.type,
            roomId: data.roomId,
            data: JSON.stringify(data)
        }
    });
}


function invite(option) {
    var data = {
        type: 'CALL',
        user: option.user,
        consultOrderId: option.consultOrderId,
        roomId: option.roomId
    }
    return setRoomInfo(data);
}

function cancel(option) {
    var data = {
        type: 'CANCEL',
        user: option.user,
        consultOrderId: option.consultOrderId,
        roomId: option.roomId
    }
    return setRoomInfo(data);
}

function refuse(option) {
    var data = {
        type: 'REJECT',
        user: option.user,
        consultOrderId: option.consultOrderId,
        roomId: option.roomId
    }
    return setRoomInfo(data);
}

module.exports = {
    getRoomInfo: getRoomInfo,
    setRoomInfo: setRoomInfo,
    invite: invite,
    cancel: cancel,
    refuse: refuse,
}