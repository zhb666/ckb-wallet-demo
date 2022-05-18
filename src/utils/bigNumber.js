// 关于大数据以及浮点数的处理
import BigNumber from "bignumber.js";
import { isArray } from "./validate";

export function Add(number, initialValue, key) {
  // 可以传入数组也可以传字符串
  if (isArray(number)) {
    return number
      .reduce((total, currentValue) => {
        if (key) {
          return total.plus(toBigNumber(currentValue[key]));
        }
        return total.plus(toBigNumber(currentValue));
      }, toBigNumber(initialValue || 0))
      .toString();
  }

  return toBigNumber(number)
    .plus(toBigNumber(initialValue || 0))
    .toString();
}

export function sum(arr) {
  return BigNumber.sum.apply(null, arr).toString();
}

export function minus(numbera, numberb) {
  return toBigNumber(numbera).minus(toBigNumber(numberb)).toString();
}
export function toPercent(value, decimalsToAppear) {
  // 转化为百分比
  return `${toBigNumber(value)
    .multipliedBy(toBigNumber(100))
    .toFixed(decimalsToAppear || 2)}%`;
}

export function div(value, decimals = 18) {
  // 除法
  return toBigNumber(value).dividedBy(new BigNumber(10).pow(decimals));
}

export function decimals(value, decimalsToAppear) {
  //默认为6位
  return divbyDecimals(value, 0, decimalsToAppear);
}

export function divbyDecimals(value, decimals = 0, decimalsToAppear = 6) {
  if (!value.toString()) return toBigNumber(0);
  // 根据精度格式化数据
  return toFixed(
    toBigNumber(value).dividedBy(new BigNumber(10).pow(decimals)),
    decimalsToAppear
  );
}
export function multiplie(value, value1, decimalsToAppear = 6) {
  // 乘法
  return toFixed(
    toBigNumber(value).multipliedBy(toBigNumber(value1)),
    decimalsToAppear
  );
}
// 精度换算
export function multiply(value, decimals) {
  // 根据精度格式化数据
  return toBigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals))
    .toFixed();
}
export function multipliebyDecimals(value, decimals, decimalsToAppear = 6) {
  // 根据精度格式化数据
  return toFixed(
    toBigNumber(value).multipliedBy(new BigNumber(10).pow(decimals)),
    decimalsToAppear
  );
}
export function toBigNumber(val) {
  return (val = BigNumber.isBigNumber(val) ? val : new BigNumber(val));
}

export function lt(one, two) {
  // 比较两个数字的大小
  return toBigNumber(one).isLessThan(toBigNumber(two));
}

export function lte(one, two) {
  // 比较两个数字的大小
  return toBigNumber(one).isLessThanOrEqualTo(toBigNumber(two));
}

export function isZero(value, decimals, decimalsToAppear) {
  return toBigNumber(divbyDecimals(value, decimals, decimalsToAppear)).isZero();
}

// 两数相乘
export function multiplyByTwoValue(one, two, decimalsToAppear) {
  // 根据精度格式化数据
  return toFixed(
    toBigNumber(one).multipliedBy(toBigNumber(two)),
    decimalsToAppear || 2
  );
}

export function toFixed(bigNumber, decimalsToAppear) {
  if (decimalsToAppear == 0) {
    return bigNumber.toFixed(0);
  }
  bigNumber = bigNumber.toString();
  const reg = new RegExp("\\d*.\\d{0," + decimalsToAppear + "}", "g");
  // 处理次幂数据，js中返回页面显示不会有e+xx方式，所以拼接处理
  const integerArr = bigNumber.split(/(e\+\d+)/),
    floatArr = bigNumber.split(/(e\-\d+)/);
  // 小数点指定位数后面截断，不使用四舍五入
  if (floatArr.length > 1) {
    let e = floatArr[1].replace("e-", "");
    if (e < decimalsToAppear) {
      return (
        coverage(e - 1) +
        "" +
        floatArr[0].replace(".", "").slice(0, decimalsToAppear - 1)
      );
    }
    return "0.0";
  }
  const arr = integerArr[0].match(reg) || [0];
  return integerArr[1] ? arr[0] + integerArr[1] : arr[0];
}

export function coverage(num) {
  let str = "0.";
  if (num) {
    while (num--) {
      str += "0";
    }
  }
  return str;
}

export function toLocaleString(value) {
  return Number(value).toLocaleString();
}
