function formatTime(date, format = 'yyyy-MM-dd hh:mm:ss:SSS') {
    date = date instanceof Date ? date : new Date(date);
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

function getUUID() {
    return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
    })
}

Date.prototype.formatTime = formatTime;
Date.prototype.parseDate = parseDate;

module.exports = {
    formatTime: formatTime,
    getUUID: getUUID
}