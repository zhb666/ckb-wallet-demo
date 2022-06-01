import axios from "axios";
// eslint-disable-next-line no-unused-vars
const instance = axios.create({
  // 自定义的请求头
  headers: {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json"
  },
  // 最多重发三次
  retry: { retries: 3 },
  // 超时设置
  timeout: 10000,
  // 是否是可信任(表示跨域请求时是否需要使用凭证)
  withCredentials: false,
  crossDomain: true
  //debug: process.env.NODE_ENV !== 'production'
  // // 响应的数据格式 json / blob /document /arraybuffer / text / stream
  // responseType: 'json',
  // XSRF 设置
  // xsrfCookieName: 'XSRF-TOKEN',
  // xsrfHeaderName: 'X-XSRF-TOKEN'
});

// instance.interceptors.request.use(
//   config => {
//     let urls = analysisUrl(config.url);
//     config.params = { ...config.params, ...urls.params };
//     //默认不缓存，需要加上时间戳
//     if (config.params) {
//       //若为get请求，则默认不缓存，需要加上时间戳；若想缓存，在配置对象上传cache：true
//       // 若为post请求，则没有时间戳
//       if (config.method.toLowerCase() == "get" && !config.cache) {
//         config.params["_t"] = +new Date();
//       }
//     }

//     return config;
//   },
//   error => {
//     //如果接口请求错误，写下日志
//     console.error(config);
//     console.error(error);
//     Promise.reject(error);
//   }
// );

// export function analysisUrl(url) {
//   var arr = (url || "").split("?");
//   var obj = {};
//   if (arr[1]) {
//     obj = parseURL(arr[1]);
//   }
//   return {
//     url: arr[0],
//     params: obj
//   };
// }

/**
 * GET method
 * 默认不缓存，需要加上时间戳；若想缓存，在配置对象上传cache：true
 *
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @param {object} options 请求配置对象
 * @returns {Promise}
 *
 * @example
 * ajaxGet('/url', { userId:501 }, { timeout: 10000 })
 */
function ajaxGet(url, params, options) {
  return instance({
    method: "GET",
    url,
    params,
    ...options
  }).then(response => response.data);
}

/**
 * POST method
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 请求配置对象，没有签名
 * @returns {Promise}
 *
 * @example
 * ajaxPost('/url?userId-501', { userId:501 }, { timeout: 10000 })
 */
function ajaxPost(url, data = {}, options = {}) {
  return instance({
    method: "POST",
    url,
    data,
    ...options
  }).then(response => response.data);
}
export { ajaxGet, ajaxPost };
