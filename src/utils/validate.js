/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === "string" || str instanceof String) {
    return true;
  }
  return false;
}

/**
 * @param {String} str
 * @returns {Boolean}
 */
export function isExist(str) {
  if (
    str !== null &&
    str !== "undefined" &&
    str !== "" &&
    typeof str !== "undefined"
  ) {
    return true;
  } else {
    return false;
  }
}
/** 对象是否为空
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isEmptyObj(obj) {
  let t;
  for (t in obj) return false;
  return true;
}
// 过滤XSS攻击
export function filterXSS(str) {
  var REGEXP1 = /&/g;
  var REGEXP2 = /</g;
  var REGEXP3 = />/g;
  var REGEXP4 = /"/g;
  var REGEXP5 = /'/g;
  var REGEXP6 = /\//g;

  str = str.replace(REGEXP1, "&amp");
  str = str.replace(REGEXP2, "&lt");
  str = str.replace(REGEXP3, "&gt");
  str = str.replace(REGEXP4, "&quot");
  str = str.replace(REGEXP5, "&#x27");
  str = str.replace(REGEXP6, "");
  return str;
}

// 浏览器平台判断
export const platform = (function () {
  var platform = {};
  if (process.browser) {
    var u = navigator.userAgent.toLowerCase();
    platform = {
      mobile: !!u.match(/applewebKit.*Mobile.*/gi), // 是否为移动终端
      ios: !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/), // ios终端
      android: !!u.match(/android/gi), // android终端
      uc: !!u.match(/linux/gi), // uc浏览器
      iPhone: !!u.match(/iphone/gi), // 是否为iPhone或者QQHD浏览器
      iPad: !!u.match(/ipad/gi), // 是否iPad
      wx: !!u.match(/micromessenger/gi), // 微信
      weibo: !!u.match(/WeiBo/gi), // 微博客户端
      QQ: !!u.match(/\sQQ/i), // qq
      // safari:!!u.match(/safari/gi),//Safari,chrome的ua中也会有Safari字段
      safari: !!/iPhone|iPad|iPod\/([\w.]+).*(safari).*/i.test(u), // Safari，
      ie: u.indexOf("trident") > -1, // IE内核
      opera: u.indexOf("presto") > -1, // opera内核
      webKit: u.indexOf("appleWebKit") > -1, // 苹果、谷歌内核
      webApp: u.indexOf("safari") == -1, // 是否web应该程序，没有头部与底部
      gecko: u.indexOf("gecko") > -1 && u.indexOf("KHTML") == -1, // 火狐内核
      firefox: u.indexOf("gecko") > -1 && u.indexOf("firefox") > -1 // 火狐浏览器
    };
  }
  return platform;
})();

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === "undefined") {
    return Object.prototype.toString.call(arg) === "[object Array]";
  }
  return Array.isArray(arg);
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isHtmlElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

export const isFunction = functionToCheck => {
  const getType = {};
  return (
    functionToCheck &&
    getType.toString.call(functionToCheck) === "[object Function]"
  );
};

export function inArray(elem, arr, i) {
  return arr == null ? -1 : arr.indexOf.call(arr, elem, i);
}
