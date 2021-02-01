/*
 * @Author: lisong
 * @Date: 2021-02-01 17:09:39
 * @Description: 
 */
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this.setData({
          nutritionVisible: newVal
        });
        this.properties.visible = !this.properties.visible;
      }
    },
    goodsList: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        this.anlizeNutrition();
      }
    },
    patient: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
        this.anlizeNutrition();
      }
    }
  },
  data: {
    nutritionVisible: false,
    nutritionlist: [],
    allNutritionlist: []
  },
  lifetimes: {
    attached() {
      this._attached();
    }
  },
  attached: function () {
    this._attached();
  },
  methods: {
    _attached() {
      this.prop = [
        'energy',
        'protein',
        'fat',
        'carbohydrate',
        'cholesterol',
        'vitaminB1',
        'vitaminB2',
        'niacin',
        'vitaminC',
        'vitaminE',
        'ca',
        'p',
        'k',
        'na',
        'mg',
        'fe',
        'zn',
        'se',
        'cu',
        'mn',
        'i',
      ]
      this.getAllNutrition();
    },
    onCloseAnalize() {
      this.setData({
        nutritionVisible: false
      });
    },
    onCloseAnalize() {
      this.setData({
        nutritionVisible: false
      });
    },
    //营养素分析
    anlizeNutrition() {
      var nutritionData = {};
      var goodsList = [];
      if (!this.data.allNutritionlist.length) {
        return;
      }
      this.prop.map(item => {
        nutritionData[item] = {
          name: wx.jyApp.constData.nutritionNameMap[item],
          standardData: 0,
          gross: 0, //每天总量
          grossPercent: 0, //每天总量占推荐值得比
          singleGross: 0 //单餐
        }
        if (['energy', 'protein', 'fat', 'carbohydrate'].indexOf(item) > -1) {
          nutritionData[item].energyPercent = '0%';
        }
      });
      this.data.goodsList.map(item => {
        if (item.type == 1) {
          goodsList.push(item);
        } else {
          item.items.map(_item => {
            _item.frequency = item.frequency;
            goodsList.push(_item);
          });
        }
      });
      _analize.bind(this)(goodsList);

      function _analize(goodsList) {
        //获取推荐值
        this.prop.map(item => {
          nutritionData[item].standardData = wx.jyApp.utils.getSuggestData(item, this.properties.patient);
        });
        goodsList.map(goods => {
          for (var i = 0; i < this.data.allNutritionlist.length; i++) {
            var item = this.data.allNutritionlist[i];
            if (item.productId == goods.productId) {
              this.prop.map(_item => {
                nutritionData[_item].singleGross += item[_item] * goods.perUseNum * 0.01;
                nutritionData[_item].gross += item[_item] * goods.perUseNum * goods.frequency * 0.01;
              });
              break;
            }
          }
        });
        this.prop.map(item => {
          var nutrition = nutritionData[item];
          nutrition.singleGross = nutrition.singleGross.toFixed(2);
          nutrition.gross = nutrition.gross.toFixed(2);
          if (nutrition.standardData) {
            nutrition.grossPercent = (nutrition.gross / nutrition.standardData * 100).toFixed(2);
          }
          if (nutritionData.energy.gross > 0) {
            switch (item) {
              case "energy":
                nutrition.energyPercent = 100 + '%';
                break;
              case "protein":
                nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                break;
              case "fat":
                nutrition.energyPercent = nutrition.gross * 9 / nutritionData.energy.gross * 100;
                nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                break;
              case "carbohydrate":
                nutrition.energyPercent = nutrition.gross * 4 / nutritionData.energy.gross * 100;
                nutrition.energyPercent = nutrition.energyPercent.toFixed(2) + '%';
                break;
            }
          }
        });
        var arr = [];
        this.prop.map(item => {
          arr.push(nutritionData[item]);
        });
        this.setData({
          nutritionlist: arr
        });
      }
    },
    //获取所有产品营养素
    getAllNutrition() {
      wx.jyApp.http({
        url: '/product/nutritionist/all'
      }).then((data) => {
        this.setData({
          allNutritionlist: data.list || []
        });
        if (this.properties.goodsList.length) {
          this.anlizeNutrition();
        }
      });
    }
  }
})