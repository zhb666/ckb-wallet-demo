// Processing of big data and floating point numbers
import BigNumber from "bignumber.js";
import { isArray } from "./validate";

export function Add(number, initialValue, key) {
  // You can pass in an array or a string
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
  // Convert to Percent
  return `${toBigNumber(value)
    .multipliedBy(toBigNumber(100))
    .toFixed(decimalsToAppear || 2)}%`;
}

export function div(value, decimals = 18) {
  // division
  return toBigNumber(value).dividedBy(new BigNumber(10).pow(decimals));
}

export function decimals(value, decimalsToAppear) {
  //The default is 6 bits
  return divbyDecimals(value, 0, decimalsToAppear);
}

export function divbyDecimals(value, decimals = 0, decimalsToAppear = 6) {
  if (!value.toString()) return toBigNumber(0);
  // Format data according to precision
  return toFixed(
    toBigNumber(value).dividedBy(new BigNumber(10).pow(decimals)),
    decimalsToAppear
  );
}
export function multiplie(value, value1, decimalsToAppear = 6) {
  // multiplication
  return toFixed(
    toBigNumber(value).multipliedBy(toBigNumber(value1)),
    decimalsToAppear
  );
}
// Precision conversion
export function multiply(value, decimals) {
  // Format data according to precision
  return toBigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals))
    .toFixed();
}
export function multipliebyDecimals(value, decimals, decimalsToAppear = 6) {
  // Format data according to precision
  return toFixed(
    toBigNumber(value).multipliedBy(new BigNumber(10).pow(decimals)),
    decimalsToAppear
  );
}
export function toBigNumber(val) {
  return (val = BigNumber.isBigNumber(val) ? val : new BigNumber(val));
}

export function lt(one, two) {
  // Compare the size of two numbers
  return toBigNumber(one).isLessThan(toBigNumber(two));
}

export function lte(one, two) {
  // Compare the size of two numbers
  return toBigNumber(one).isLessThanOrEqualTo(toBigNumber(two));
}

export function isZero(value, decimals, decimalsToAppear) {
  return toBigNumber(divbyDecimals(value, decimals, decimalsToAppear)).isZero();
}

// Multiply two numbers
export function multiplyByTwoValue(one, two, decimalsToAppear) {
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
  // Processing power data, the returned page in js will not display in e+xx mode, so splicing processing
  const integerArr = bigNumber.split(/(e\+\d+)/),
    floatArr = bigNumber.split(/(e\-\d+)/);
  // Truncate after the specified number of decimal places without rounding
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
