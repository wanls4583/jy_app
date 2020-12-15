//获取单位信息
export const unitChange = {
  JIN: '斤',
  LIANG: '两',
  KILOGRAM: '公斤',
  GRAM: '克',
  MILLILITER: '毫升',
  BAG: '袋',
  TIAO: '条',
  GE: '个',
  BEI: '杯',
  WAN: '碗',
  PING: '瓶',
  LI: '粒',
  PIAN: '片',
  KE: '颗',
  GUAN: '罐',
  HE: '盒',
  FEN: '份',
  BAO: '包'
}
export const frequencyArray = [];
for (var i = 0; i < 50; i++) {
  switch (i) {
    default:
      frequencyArray[i] = '一天' + (i + 1) + '次';
  }
}
export const frequencyMapRev = {};
for (var i = 1; i <= 50; i++) {
  switch (i) {
    default:
      frequencyMapRev['一天' + i + '次'] = i;
  }
}
export const giveWayMap = {
  "PUMP": "泵入",
  "PUSH": "间断推注",
  "MOUTH": "经口饮入",
  "DROP": "重力滴注"
};
export const giveWayMapRev = {
  '泵入': 'PUMP',
  '间断推注': 'PUSH',
  '经口饮入': 'MOUTH',
  '重力滴注': 'DROP'
};
export const enternalWayMap = {
  "NOSE_STOMACH": "鼻胃管",
  "NOSE_GUT": "经鼻空肠",
  "NOSE_DUODENUM": "经鼻十二指肠",
  "MOUTH": "经口",
  "SKIN_GUT": "经皮内窥镜下空肠造瘘",
  "SKIN_STOMACH": "经皮内窥镜下胃造瘘",
  "GUT": "空肠造瘘",
  "STOMACH": "胃造瘘"
}
export const longOrTemporaryMap = {
  'TEMPORARY': '临时整取',
  'LONG': '临时配制',
  'LONG_TERM': '长期指导'
};
export const longOrTemporaryMapRev = {
  '临时整取': 'TEMPORARY',
  '临时配制': 'LONG',
  '长期指导': 'LONG_TERM'
};
export const preparationFormMap = {
  'POWDER': '粉剂',
  'LIQUID': '液体'
}
export const preparationFormMapRev = {
  '粉剂': 'POWDER',
  '液体': 'LIQUID'
}
export const payMap = {
  'WXPAY': '微信支付',
  'ALIPAY': '支付宝支付',
  'CASH': '现金支付',
  'POS': 'POS机刷卡',
  'OUTLINE-WXPAY': '微信H5支付'
}
export const payList = [{
  label: '微信支付',
  value: 'WXPAY'
},
{
  label: '支付宝支付',
  value: 'ALIPAY'
},
{
  label: 'POS机刷卡',
  value: 'POS'
},
{
  label: '现金支付',
  value: 'CASH'
}
]
export const payMapRev = {
  '微信支付': 'WXPAY',
  '支付宝支付': 'ALIPAY',
  '现金支付': 'CASH',
  'POS机刷卡': 'POS',
  '微信H5支付': 'OUTLINE-WXPAY'
}
//商城订单
export const mallOrderStatusMap = {
  '0': '未支付',
  '1': '已支付',
  '2': '支付失败',
  '3': '已取消',
  '4': '已失效',
  '5': '退费中',
  '6': '已退费',
  '7': '已发货',
  '8': '已完成',
  '9': '发货中'
}
//问诊订单
export const interrogationOrderStatusMap = {
  '0': '未支付',
  '1': '已支付',
  '2': '支付失败',
  '3': '已完成',
  '4': '已失效',
  '5': '就诊中',
  '6': '退费中',
  '7': '已退费'
}
//申请指导订单
export const applyOrderStatusMap = {
  '0': '未支付',
  '1': '待处理',
  '2': '已完成',
  '3': '支付失败',
  '4': '退费中',
  '5': '已退费'
}
export const typeMap = {
  '1': '非处方',
  '2': '整取',
  '3': '套餐'
}
export const subIds = {
  'patientPayMsg': '7-Yxz1A_B_sloIu28bAEUtlgWmltGul5Yl9pQCXfzuY',
  'doctorReciveMsg': 'mr0I6bbT1vi27P_qSnOaalBaKepLb-aTRudnJx27Aok',
  'phone': 'x_SCWh8uk9zeSwbpIAkz3htoua27Jjlf0hG-kfNM5Uw',
  'appointmentSuc': 'OnHKW-18JNl7SaLjd2TrHmYzm50rp4Q8jvl7Qn84R-s',
  'appointment': 'edTETw5PCUvKhcQ3a8ZpcOXAy6f_FEoMdEOOn5BYWqk',
}
export const dayArr = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']