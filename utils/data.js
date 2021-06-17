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
  '7': '已退费',
  '8': '转诊中',
  '9': '已转诊'
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
  'dietaryFiber': '膳食纤维(g)',
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
var _yingyangtuijian = [];
(function () {
  var prop = ['energy', 'protein', 'fat', 'carbohydrate', 'dietaryFiber', 'ca', 'fe', 'zn', 'se', 'cu', 'mn', 'mg', 'na', 'k', 'p', 'vitaminA', 'vitaminE', 'vitaminB1', 'vitaminB2', 'vitaminC', 'niacin', 'cholesterol', 'water', 'vpp', 'i']
  var tuijianStrArr = ['年龄,性别,能量(kcal),蛋白质(g),脂肪(g),碳水化合物（g）,膳食纤维（g）,钙（mg）,铁（mg）,锌（mg）,硒（ug）,铜（mg）,锰（mg）,镁（mg）,钠（mg）,钾（mg）,磷（mg）,维生素A（ugRAE）,维生素E（mg）,维生素B1（mg）,维生素B2（mg）,维生素C（mg）,烟酸（mg）,胆固醇（mg）,水（ml）,叶酸（ug）,碘（ug）,嘌呤（mg）',
    '0-6月,男/女,90*入院体重,9,48,60,/,200,0.3,2,15,0.3,0.01,20,170,350,100,300,3,0.1,0.4,40,2,120,,65,85,',
    '7-12月,男/女,80*入院体重,20,40,85,/,250,10,3.5,20,0.3,0.7,65,350,550,180,350,4,0.3,0.5,40,3,150,,100,115,',
    '1岁,男,900,25,35,121,9,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    ',女,800,25,31,105,8,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    '2岁,男,1100,25,43,153,11,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    ',女,1000,25,39,137,10,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    '3岁,男,1250,30,49,172,12.5,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    ',女,1200,30,47,164,12,600,9,4,25,0.3,1.5,140,700,900,300,310,6,0.6,0.6,40,6,200,,160,90,',
    '4岁,男,1300,30,43,198,13,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    ',女,1250,30,42,188,12.5,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    '5岁,男,1400,30,47,214,14,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    ',女,1300,30,43,198,13,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    '6岁,男,1600,35,47,209,16,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    ',女,1450,35,42,183,14.5,800,10,5.5,30,0.4,2,160,900,1200,350,360,7,0.8,0.7,50,8,250,,190,90,',
    '7岁,男,1700,40,48,227,17,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,11,300,,250,90,',
    ',女,1550,40,45,196,15.5,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,10,300,,250,90,',
    '8岁,男,1850,40,51,258,18.5,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,11,300,,250,90,',
    ',女,1700,40,47,217,17,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,10,300,,250,90,',
    '9岁,男,2000,45,53,273,20,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,11,300,,250,90,',
    ',女,1800,45,50,230,18,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,10,300,,250,90,',
    '10岁,男,2050,50,56,274,20.5,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,11,300,,250,90,',
    ',女,1900,50,53,243,19,1000,13,7,40,0.5,3,220,1200,1500,470,500,9,1,1,65,10,300,,250,90,',
    '11-13岁,男,2350,60,64,308,23.5,1200,15,10,55,0.7,4,300,1400,1900,640,670,13,1.3,1.3,90,14,400,,350,110,',
    ',女,2050,55,58,264,20.5,1200,18,9,55,0.7,4,300,1400,1900,640,630,13,1.1,1.1,90,12,400,,350,110,',
    '14-17岁,男,2850,75,78,374,25,1000,16,12,60,0.8,4.5,320,1600,2200,710,820,14,1.6,1.5,100,16,500,,400,120,',
    ',女,2300,60,64,296,25,1000,18,8.5,60,0.8,4.5,320,1600,2200,710,630,14,1.3,1.2,100,13,400,,400,120,',
    '18-49岁,男,2600,65,68,344,25,800,12,12.5,60,0.8,4.5,330,1500,2000,720,800,14,1.4,1.4,100,15,500,,400,120,',
    ',女,2100,55,58,264,25,800,20,7.5,60,0.8,4.5,330,1500,2000,720,700,14,1.2,1.2,100,12,400,,400,120,',
    '50-64岁,男,2450,65,63,318,25,1000,12,12.5,60,0.8,4.5,330,1400,2000,720,800,14,1.4,1.4,100,14,500,,400,120,',
    ',女,2050,55,53,263,25,1000,12,7.5,60,0.8,4.5,330,1400,2000,720,700,14,1.2,1.2,100,12,400,,400,120,',
    '65-79岁,男,2350,65,52,330,25,1000,12,12.5,60,0.8,4.5,320,1400,2000,700,800,14,1.4,1.4,100,14,500,,400,120,',
    ',女,1950,55,49,260,25,1000,12,7.5,60,0.8,4.5,320,1400,2000,700,700,14,1.2,1.2,100,11,400,,400,120,',
    '80岁以上,男,2200,65,53,291,25,1000,12,12.5,60,0.8,4.5,310,1300,2000,670,800,14,1.4,1.4,100,13,500,,400,120,',
    ',女,1750,55,47,214,25,1000,12,7.5,60,0.8,4.5,310,1300,2000,670,700,14,1.2,1.2,100,10,400,,400,120,',
    '孕妇（孕早期）,女,2100,55,58,264,25,800,20,9.5,65,0.9,4.9,370,1500,2000,720,700,14,1.2,1.2,100,12,420,,600,230,',
    '孕妇（孕中期）,女,2400,70,68,302,25,1000,24,9.5,65,0.9,4.9,370,1500,2000,720,770,14,1.4,1.4,115,12,420,,600,230,',
    '孕妇（孕晚期）,女,2550,85,72,315,25,1000,29,9.5,65,0.9,4.9,370,1500,2000,720,770,14,1.5,1.5,115,12,420,,600,230,',
    '乳母（哺乳期）,女,2600,80,54,248,25,1000,24,12,78,1.4,4.8,330,1500,2400,720,1300,17,1.5,1.5,150,15,520,,550,240,',
  ];
  tuijianStrArr = tuijianStrArr.slice(1);
  var preObj = null;
  tuijianStrArr.map(function (item) {
    var obj = {};
    var data = item.split(',');
    var age = data[0];
    if (age) {
      if (age.indexOf('月') > -1) {
        age = age.substring(0, age.length - 1);
        if (age.indexOf('-') > -1) {
          obj.minAge = age.split('-')[0] / 12;
          obj.maxAge = age.split('-')[1] / 12;
        } else {
          obj.minAge = Number(age);
          obj.maxAge = Number(age);
        }
      } else if (age.indexOf('以上') > -1) {
        obj.minAge = parseInt(age);
        obj.maxAge = 200;
      } else if (age.indexOf('岁') > -1) {
        age = age.substring(0, age.length - 1);
        if (age.indexOf('-') > -1) {
          obj.minAge = Number(age.split('-')[0]);
          obj.maxAge = Number(age.split('-')[1]);
        } else {
          obj.minAge = Number(age);
          obj.maxAge = Number(age);
        }
      } else if (age.indexOf('孕早期') > -1) {
        obj.minAge = 1001;
        obj.maxAge = 1001;
      } else if (age.indexOf('孕中期') > -1) {
        obj.minAge = 1002;
        obj.maxAge = 1002;
      } else if (age.indexOf('孕晚期') > -1) {
        obj.minAge = 1003;
        obj.maxAge = 1003;
      } else if (age.indexOf('哺乳期') > -1) {
        obj.minAge = 1004;
        obj.maxAge = 1004;
      }
    } else {
      obj.minAge = preObj.minAge;
      obj.maxAge = preObj.maxAge;
    }
    prop.map(function (item, index) {
      obj[item] = Number(data[index + 2]) || 0;
    });
    if (data[1] == '男/女') {
      obj.sex = 1;
      _yingyangtuijian.push(obj);
      obj = Object.assign({}, obj);
      obj.sex = 0;
      _yingyangtuijian.push(obj);
    } else if (data[1] == '男') {
      obj.sex = 1;
      _yingyangtuijian.push(obj);
    } else if (data[1] == '女') {
      obj.sex = 0;
      _yingyangtuijian.push(obj);
    }
    preObj = obj;
  });
})();

export const yingyangtuijian = _yingyangtuijian;

// 青少年超重数据
export const overWeight = [
  [6.0, 16.4, 17.7, 16.2, 17.5],
  [6.5, 16.7, 18.1, 16.5, 18.0],
  [7.0, 17.0, 18.7, 16.8, 18.5],
  [7.5, 17.4, 19.2, 17.2, 19.0],
  [8.0, 17.8, 19.7, 17.6, 19.4],
  [8.5, 18.1, 20.3, 18.1, 19.9],
  [9.0, 18.5, 20.8, 18.5, 20.4],
  [9.5, 18.9, 21.4, 19.0, 21.0],
  [10.0, 19.2, 21.9, 19.5, 21.5],
  [10.5, 19.6, 22.5, 20.0, 22.1],
  [11.0, 19.9, 23.0, 20.5, 22.7],
  [11.5, 20.3, 23.6, 21.1, 23.3],
  [12.0, 20.7, 24.1, 21.5, 23.9],
  [12.5, 21.0, 24.7, 21.9, 24.5],
  [13.0, 21.4, 25.2, 22.2, 25.0],
  [13.5, 21.9, 25.7, 22.6, 25.6],
  [14.0, 22.3, 26.1, 22.8, 25.9],
  [14.5, 22.6, 26.4, 23.0, 26.3],
  [15.0, 22.9, 26.6, 23.2, 26.6],
  [15.5, 23.1, 26.9, 23.4, 26.9],
  [16.0, 23.3, 27.1, 23.6, 27.1],
  [16.5, 23.5, 27.4, 23.7, 27.4],
  [17.0, 23.7, 27.6, 23.8, 27.6],
  [17.5, 23.8, 27.8, 23.9, 27.8],
  [18.0, 24.0, 28.0, 24.0, 28.0]
]

// 青少年腰围数据
export const waist = [
  [7, 58.4, 63.6, 55.8, 60.2],
  [8, 60.8, 66.8, 57.6, 62.5],
  [9, 63.4, 70.0, 59.8, 65.1],
  [10, 65.9, 73.1, 62.2, 67.8],
  [11, 68.1, 75.6, 64.6, 70.4],
  [12, 69.8, 77.4, 66.8, 72.6],
  [13, 71.3, 78.6, 68.5, 74.0],
  [14, 72.6, 79.6, 69.6, 74.9],
  [15, 73.8, 80.5, 70.4, 75.5],
  [16, 74.8, 81.3, 70.9, 75.8],
  [17, 75.7, 82.1, 71.2, 76.0],
  [18, 76.8, 83.0, 71.3, 76.1]
]