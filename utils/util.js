function formatTime(date, format = 'yyyy-MM-dd hh:mm:ss:SSS') {
    if (this instanceof Date) {
        format = date || 'yyyy-MM-dd hh:mm:ss:SSS';
        date = this;
    } else {
        date = date instanceof Date ? date : new Date(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millis = date.getMilliseconds();
    format = format.replace('yyyy', year);
    format = format.replace('MM', ('0' + month).slice(-2));
    format = format.replace('dd', ('0' + day).slice(-2));
    format = format.replace('hh', ('0' + hour).slice(-2));
    format = format.replace('mm', ('0' + minute).slice(-2));
    format = format.replace('ss', ('0' + second).slice(-2));
    format = format.replace('SSS', millis);
    return format;
}

function parseDate(str, split) {
    var arr = str.split(split || '-');
    return new Date(Number(arr[0]), Number(arr[1]), Number(arr[2]));
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function getUUID(len) {
    len = len || 16;
    var str = '';
    for (var i = 0; i < len; i++) {
        str += (Math.random() * 16 | 0).toString(16);
    }
    return str;
}

Date.prototype.formatTime = formatTime;
Date.prototype.parseDate = parseDate;

module.exports = {
    formatTime: formatTime,
    getUUID: getUUID
}