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
  'LONG': '临时配制',
  'TEMPORARY': '临时整取',
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
  '9': '发货中',
  '10': '审核中',
  '11': '审核不通过'
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
export const nutritionNameMap = {
  'ca': '钙(mg)',
  'carbohydrate': '碳水化合物(g)',
  'cholesterol': '胆固醇(mg)',
  'cu': '铜(mg)',
  'energy': '能量(kcal)',
  'fat': '脂肪(g)',
  'fe': '铁(mg)',
  'i': '碘(ug)',
  'k': '钾(mg)',
  'mg': '镁(mg)',
  'mn': '锰(mg)',
  'na': '钠(mg)',
  'niacin': '烟酸(mg)',
  'p': '磷(mg)',
  'protein': '蛋白质(g)',
  'se': '硒(ug)',
  'vitaminB1': '维生素B1(mg)',
  'vitaminB2': '维生素B2(mg)',
  'vitaminC': '维生素C(mg)',
  'vitaminE': '维生素E(mg)',
  'zn': '锌(mg)'
}
export const emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig
//营养素推荐值
export const yingyangtuijian = [{
    maxAge: 0,
    minAge: 0.5,
    sex: 1,
    energy: 0,
    protein: 9,
    fat: 48,
    carbohydrate: 60,
    dietaryFiber: 0,
    ca: 200,
    fe: 0.3,
    zn: 2,
    se: 15,
    cu: 0.3,
    mn: 0.01,
    mg: 20,
    na: 170,
    k: 350,
    p: 100,
    vitaminA: 300,
    vitaminE: 3,
    vitaminB1: 0.1,
    vitaminB2: 0.4,
    vitaminC: 40,
    niacin: 2,
    cholesterol: 120,
    vpp: 65,
    i: 85
  },
  {
    maxAge: 0,
    minAge: 0.5,
    sex: 0,
    energy: 0,
    protein: 9,
    fat: 48,
    carbohydrate: 60,
    dietaryFiber: 0,
    ca: 200,
    fe: 0.3,
    zn: 2,
    se: 15,
    cu: 0.3,
    mn: 0.01,
    mg: 20,
    na: 170,
    k: 350,
    p: 100,
    vitaminA: 300,
    vitaminE: 3,
    vitaminB1: 0.1,
    vitaminB2: 0.4,
    vitaminC: 40,
    niacin: 2,
    cholesterol: 120,
    vpp: 65,
    i: 85
  },
  {
    maxAge: 0.6,
    minAge: 0.9,
    sex: 1,
    energy: 0,
    protein: 20,
    fat: 40,
    carbohydrate: 85,
    dietaryFiber: 0,
    ca: 250,
    fe: 10,
    zn: 3.5,
    se: 20,
    cu: 0.3,
    mn: 0.7,
    mg: 65,
    na: 350,
    k: 550,
    p: 180,
    vitaminA: 350,
    vitaminE: 4,
    vitaminB1: 0.3,
    vitaminB2: 0.5,
    vitaminC: 40,
    niacin: 3,
    cholesterol: 150,
    vpp: 100,
    i: 115
  },
  {
    maxAge: 0.6,
    minAge: 0.9,
    sex: 0,
    energy: 0,
    protein: 20,
    fat: 40,
    carbohydrate: 85,
    dietaryFiber: 0,
    ca: 250,
    fe: 10,
    zn: 3.5,
    se: 20,
    cu: 0.3,
    mn: 0.7,
    mg: 65,
    na: 350,
    k: 550,
    p: 180,
    vitaminA: 350,
    vitaminE: 4,
    vitaminB1: 0.3,
    vitaminB2: 0.5,
    vitaminC: 40,
    niacin: 3,
    cholesterol: 150,
    vpp: 100,
    i: 115
  },
  {
    maxAge: 1,
    minAge: 1,
    sex: 1,
    energy: 900,
    protein: 25,
    fat: 35,
    carbohydrate: 121,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 1,
    minAge: 1,
    sex: 0,
    energy: 800,
    protein: 25,
    fat: 31,
    carbohydrate: 105,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 2,
    minAge: 2,
    sex: 1,
    energy: 1100,
    protein: 25,
    fat: 43,
    carbohydrate: 153,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 2,
    minAge: 2,
    sex: 0,
    energy: 1000,
    protein: 25,
    fat: 39,
    carbohydrate: 137,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 3,
    minAge: 3,
    sex: 1,
    energy: 1250,
    protein: 30,
    fat: 49,
    carbohydrate: 172,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 3,
    minAge: 3,
    sex: 0,
    energy: 1200,
    protein: 30,
    fat: 47,
    carbohydrate: 164,
    dietaryFiber: 0,
    ca: 600,
    fe: 9,
    zn: 4,
    se: 25,
    cu: 0.3,
    mn: 1.5,
    mg: 140,
    na: 700,
    k: 900,
    p: 300,
    vitaminA: 310,
    vitaminE: 6,
    vitaminB1: 0.6,
    vitaminB2: 0.6,
    vitaminC: 40,
    niacin: 6,
    cholesterol: 200,
    vpp: 160,
    i: 90
  },
  {
    maxAge: 4,
    minAge: 4,
    sex: 1,
    energy: 1300,
    protein: 30,
    fat: 43,
    carbohydrate: 198,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 4,
    minAge: 4,
    sex: 0,
    energy: 1250,
    protein: 30,
    fat: 42,
    carbohydrate: 188,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 5,
    minAge: 5,
    sex: 1,
    energy: 1400,
    protein: 30,
    fat: 47,
    carbohydrate: 214,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 5,
    minAge: 5,
    sex: 0,
    energy: 1300,
    protein: 30,
    fat: 43,
    carbohydrate: 198,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 6,
    minAge: 6,
    sex: 1,
    energy: 1400,
    protein: 35,
    fat: 47,
    carbohydrate: 209,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 6,
    minAge: 6,
    sex: 0,
    energy: 1250,
    protein: 35,
    fat: 42,
    carbohydrate: 183,
    dietaryFiber: 0,
    ca: 800,
    fe: 10,
    zn: 5.5,
    se: 30,
    cu: 0.4,
    mn: 2,
    mg: 160,
    na: 900,
    k: 1200,
    p: 350,
    vitaminA: 310,
    vitaminE: 7,
    vitaminB1: 0.8,
    vitaminB2: 0.7,
    vitaminC: 50,
    niacin: 8,
    cholesterol: 250,
    vpp: 190,
    i: 90
  },
  {
    maxAge: 7,
    minAge: 7,
    sex: 1,
    energy: 1500,
    protein: 40,
    fat: 48,
    carbohydrate: 227,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 11,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 7,
    minAge: 7,
    sex: 0,
    energy: 1350,
    protein: 40,
    fat: 45,
    carbohydrate: 196,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 10,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 8,
    minAge: 8,
    sex: 1,
    energy: 1650,
    protein: 40,
    fat: 51,
    carbohydrate: 258,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 11,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 8,
    minAge: 8,
    sex: 0,
    energy: 1450,
    protein: 40,
    fat: 47,
    carbohydrate: 217,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 10,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 9,
    minAge: 9,
    sex: 1,
    energy: 1750,
    protein: 45,
    fat: 53,
    carbohydrate: 273,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 11,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 9,
    minAge: 9,
    sex: 0,
    energy: 1550,
    protein: 45,
    fat: 50,
    carbohydrate: 230,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 10,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 10,
    minAge: 10,
    sex: 1,
    energy: 1800,
    protein: 50,
    fat: 56,
    carbohydrate: 274,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 11,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 10,
    minAge: 10,
    sex: 0,
    energy: 1650,
    protein: 50,
    fat: 53,
    carbohydrate: 243,
    dietaryFiber: 0,
    ca: 1000,
    fe: 13,
    zn: 7,
    se: 40,
    cu: 0.5,
    mn: 3,
    mg: 220,
    na: 1200,
    k: 1500,
    p: 470,
    vitaminA: 500,
    vitaminE: 9,
    vitaminB1: 1,
    vitaminB2: 1,
    vitaminC: 65,
    niacin: 10,
    cholesterol: 300,
    vpp: 250,
    i: 90
  },
  {
    maxAge: 11,
    minAge: 13,
    sex: 1,
    energy: 2050,
    protein: 60,
    fat: 64,
    carbohydrate: 308,
    dietaryFiber: 0,
    ca: 1200,
    fe: 15,
    zn: 10,
    se: 55,
    cu: 0.7,
    mn: 4,
    mg: 300,
    na: 1400,
    k: 1900,
    p: 640,
    vitaminA: 670,
    vitaminE: 13,
    vitaminB1: 1.3,
    vitaminB2: 1.3,
    vitaminC: 90,
    niacin: 14,
    cholesterol: 400,
    vpp: 350,
    i: 110
  },
  {
    maxAge: 11,
    minAge: 13,
    sex: 0,
    energy: 1800,
    protein: 55,
    fat: 58,
    carbohydrate: 264,
    dietaryFiber: 0,
    ca: 1200,
    fe: 18,
    zn: 9,
    se: 55,
    cu: 0.7,
    mn: 4,
    mg: 300,
    na: 1400,
    k: 1900,
    p: 640,
    vitaminA: 630,
    vitaminE: 13,
    vitaminB1: 1.1,
    vitaminB2: 1.1,
    vitaminC: 90,
    niacin: 12,
    cholesterol: 400,
    vpp: 350,
    i: 110
  },
  {
    maxAge: 14,
    minAge: 17,
    sex: 1,
    energy: 2500,
    protein: 75,
    fat: 78,
    carbohydrate: 374,
    dietaryFiber: 0,
    ca: 1000,
    fe: 16,
    zn: 11.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 320,
    na: 1600,
    k: 2200,
    p: 710,
    vitaminA: 820,
    vitaminE: 14,
    vitaminB1: 1.6,
    vitaminB2: 1.5,
    vitaminC: 100,
    niacin: 16,
    cholesterol: 500,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 14,
    minAge: 17,
    sex: 0,
    energy: 2000,
    protein: 60,
    fat: 64,
    carbohydrate: 296,
    dietaryFiber: 0,
    ca: 1000,
    fe: 18,
    zn: 8.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 320,
    na: 1600,
    k: 2200,
    p: 710,
    vitaminA: 630,
    vitaminE: 14,
    vitaminB1: 1.3,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 13,
    cholesterol: 400,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 18,
    minAge: 49,
    sex: 1,
    energy: 2250,
    protein: 65,
    fat: 68,
    carbohydrate: 344,
    dietaryFiber: 0,
    ca: 800,
    fe: 12,
    zn: 12.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 330,
    na: 1500,
    k: 2000,
    p: 720,
    vitaminA: 800,
    vitaminE: 14,
    vitaminB1: 1.4,
    vitaminB2: 1.4,
    vitaminC: 100,
    niacin: 15,
    cholesterol: 500,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 18,
    minAge: 49,
    sex: 0,
    energy: 1800,
    protein: 55,
    fat: 58,
    carbohydrate: 264,
    dietaryFiber: 0,
    ca: 800,
    fe: 20,
    zn: 7.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 330,
    na: 1500,
    k: 2000,
    p: 720,
    vitaminA: 700,
    vitaminE: 14,
    vitaminB1: 1.2,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 12,
    cholesterol: 400,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 50,
    minAge: 64,
    sex: 1,
    energy: 2100,
    protein: 65,
    fat: 63,
    carbohydrate: 318,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 12.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 330,
    na: 1400,
    k: 2000,
    p: 720,
    vitaminA: 800,
    vitaminE: 14,
    vitaminB1: 1.4,
    vitaminB2: 1.4,
    vitaminC: 100,
    niacin: 14,
    cholesterol: 500,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 50,
    minAge: 64,
    sex: 0,
    energy: 1750,
    protein: 55,
    fat: 53,
    carbohydrate: 263,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 7.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 330,
    na: 1400,
    k: 2000,
    p: 720,
    vitaminA: 700,
    vitaminE: 14,
    vitaminB1: 1.2,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 12,
    cholesterol: 400,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 65,
    minAge: 79,
    sex: 1,
    energy: 2050,
    protein: 65,
    fat: 52,
    carbohydrate: 330,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 12.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 320,
    na: 1400,
    k: 2000,
    p: 700,
    vitaminA: 800,
    vitaminE: 14,
    vitaminB1: 1.4,
    vitaminB2: 1.4,
    vitaminC: 100,
    niacin: 14,
    cholesterol: 500,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 65,
    minAge: 79,
    sex: 0,
    energy: 1700,
    protein: 55,
    fat: 49,
    carbohydrate: 260,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 7.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 320,
    na: 1400,
    k: 2000,
    p: 700,
    vitaminA: 700,
    vitaminE: 14,
    vitaminB1: 1.2,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 11,
    cholesterol: 400,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 80,
    minAge: 1000,
    sex: 1,
    energy: 1900,
    protein: 65,
    fat: 53,
    carbohydrate: 291,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 12.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 310,
    na: 1400,
    k: 2000,
    p: 670,
    vitaminA: 800,
    vitaminE: 14,
    vitaminB1: 1.4,
    vitaminB2: 1.4,
    vitaminC: 100,
    niacin: 14,
    cholesterol: 500,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 80,
    minAge: 1000,
    sex: 0,
    energy: 1500,
    protein: 55,
    fat: 47,
    carbohydrate: 214,
    dietaryFiber: 0,
    ca: 1000,
    fe: 12,
    zn: 7.5,
    se: 60,
    cu: 0.8,
    mn: 4.5,
    mg: 310,
    na: 1400,
    k: 2000,
    p: 670,
    vitaminA: 700,
    vitaminE: 14,
    vitaminB1: 1.2,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 11,
    cholesterol: 400,
    vpp: 400,
    i: 120
  },
  {
    maxAge: 1001,
    minAge: 1001,
    sex: 0,
    energy: 1800,
    protein: 55,
    fat: 58,
    carbohydrate: 264,
    dietaryFiber: 0,
    ca: 800,
    fe: 20,
    zn: 9.5,
    se: 65,
    cu: 0.9,
    mn: 4.9,
    mg: 370,
    na: 1500,
    k: 2000,
    p: 720,
    vitaminA: 700,
    vitaminE: 14,
    vitaminB1: 1.2,
    vitaminB2: 1.2,
    vitaminC: 100,
    niacin: 12,
    cholesterol: 420,
    vpp: 600,
    i: 230
  },
  {
    maxAge: 1002,
    minAge: 1002,
    sex: 0,
    energy: 2100,
    protein: 70,
    fat: 68,
    carbohydrate: 302,
    dietaryFiber: 0,
    ca: 1000,
    fe: 24,
    zn: 9.5,
    se: 65,
    cu: 0.9,
    mn: 4.9,
    mg: 370,
    na: 1500,
    k: 2000,
    p: 720,
    vitaminA: 770,
    vitaminE: 14,
    vitaminB1: 1.4,
    vitaminB2: 1.4,
    vitaminC: 115,
    niacin: 12,
    cholesterol: 420,
    vpp: 600,
    i: 230
  },
  {
    maxAge: 1003,
    minAge: 1003,
    sex: 0,
    energy: 2250,
    protein: 85,
    fat: 72,
    carbohydrate: 315,
    dietaryFiber: 0,
    ca: 1000,
    fe: 29,
    zn: 9.5,
    se: 65,
    cu: 0.9,
    mn: 4.9,
    mg: 370,
    na: 1500,
    k: 2000,
    p: 720,
    vitaminA: 770,
    vitaminE: 14,
    vitaminB1: 1.5,
    vitaminB2: 1.5,
    vitaminC: 115,
    niacin: 12,
    cholesterol: 420,
    vpp: 600,
    i: 230
  },
  {
    maxAge: 1004,
    minAge: 1004,
    sex: 0,
    energy: 1800,
    protein: 80,
    fat: 54,
    carbohydrate: 248,
    dietaryFiber: 0,
    ca: 1000,
    fe: 24,
    zn: 12,
    se: 78,
    cu: 1.4,
    mn: 4.8,
    mg: 330,
    na: 1500,
    k: 2400,
    p: 720,
    vitaminA: 1300,
    vitaminE: 17,
    vitaminB1: 1.5,
    vitaminB2: 1.5,
    vitaminC: 150,
    niacin: 15,
    cholesterol: 520,
    vpp: 550,
    i: 240
  }
];