// import header_default from '@/assets/header_default.png';
// import header_small from '@/assets/header_small.png';
/*
 * Created By Chris Su on 2018-07-18 20:08:02
 */
/*
 * Created By Chris Su on 2018-07-18 20:08:02
 */
import moment from 'moment';
import unknow from '@/assets/type/unknow.png';
import get from '@/assets/type/get.png';
import post from '@/assets/type/post.png';
import lua from '@/assets/type/lua.png';
import { message } from 'quanta-design';
import { ORDER_TYPE } from '@/utils/enums';

export const isArray = val => Object.prototype.toString.call(val) === '[object String]';
export const isObject = val => Object.prototype.toString.call(val) === '[object Object]';
export const isFunction = val => Object.prototype.toString.call(val) === '[object Function]';
export const isBoolean = val => Object.prototype.toString.call(val) === '[object Boolean]';

// 形如 123., .123, xx, null, '',都不是数字
export const isNotCompleteNumber = val =>
  isNaN(val) || // eslint-disable-line
  val === '' ||
  val === null ||
  (val && val.toString().indexOf('.') === val.toString().length - 1) ||
  (val && val.toString().indexOf('.') === 0);

// const getUrlPrefix = () => {
//   const middleUrl = '/api/v1/image';
//   // eslint-disable-next-line
//   const reg = /(http|https)\:\/\/(localhost|127.0.0.1)\:(\d)+/;
//   if (reg.test(window.location.origin)) {
//     return `${middleUrl}`; // 本地开发环境
//   }
//   return `${window.location.origin}${middleUrl}`;
// };

export const concatString = (str, l) => (str.length > l ? `${str.substring(0, l)}...` : str);

export const ImagePrefix =
  window.location.host === 'admin.filoop.com'
    ? '//upload.filoop.com/'
    : '//q6ljkd1dq.bkt.clouddn.com/'; // 七牛云图片域名
export const QiniuUploadApi = '//upload-z2.qiniup.com/'; // 七牛云图片上传地址

export const getURLWithPrefix = url => {
  // const reg = /^\/data\/accounts\/.*$/;
  if (!url) return '';
  // if (reg.exec(url)) return `${ImagePrefix}/api/v1/image${url}`;
  // 如果图片地址是一个完整的地址，直接返回
  if (url.startsWith('http')) return url;
  return ImagePrefix + url;
};

const datetimeFormat = 'YYYY-MM-DD HH:mm:ss';
export const jsonifyParams = params =>
  Object.keys(params)
    .map(key =>
      params[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}` : '',
    )
    .filter(v => v)
    .join('&');

// timestamp: 秒
export const formatTime = timestamp => moment(timestamp * 1000).format(datetimeFormat);
export const formatDate = timestamp => moment(timestamp * 1000).format('YYYY-MM-DD');

export const formatUserTime = timestamp => formatTime(String(timestamp).substring(0, 10));

export const datetimeToTimestamp = datetime => moment(datetime, datetimeFormat).valueOf();

export const isFormValues = formObj => Object.keys(formObj).some(field => !formObj[field]);

export const isFormErrors = formObj => Object.keys(formObj).some(field => formObj[field]);

export const roundNum = (value, n) => Math.round(value * 10 ** n) / 10 ** n;

export const addIndexToMapArray = arr => {
  const newArray =
    arr &&
    arr.map((v, i) => {
      const value = v;
      value.index = i;
      return value;
    });
  return newArray;
};

export const addIndexToMapArrayAndFilter = (arr, filter) => {
  const newArray = arr && arr.filter(v => v[filter]);
  return addIndexToMapArray(newArray);
};

// 获取元素本身距离文档顶部的高度
export const getActuralOffset = (element, type) => {
  let el = element;
  let result = 0;
  // 循环遍历已定位父元素
  while (el && el.offsetParent !== null) {
    // body的offsetParent=null
    result += el[`offset${type}`];
    el = el.offsetParent;
  }
  return result;
};

export const noAuth = (authCode, userInfo) => {
  const { accessCodeList = [], viewer } = userInfo;
  if (viewer === 'USER') return false; // 个人视图开放所有权限

  let res = true; // 默认无权限
  if (typeof authCode === 'object') {
    for (let index = 0; index < authCode.length; index += 1) {
      if (accessCodeList.some(access => access === authCode[index])) {
        res = false;
        break;
      }
    }
  } else res = !accessCodeList.some(access => access === authCode);
  return res;
};

// socket 下拉列表的操作权限
export const hasOperateAuth = (opt, userInfo) => {
  if (noAuth(opt.code, userInfo)) return false;
  if (opt.disabled) return false;
  return true;
};

// 是否是超级管理员
export const isAdmin = userInfo => {
  const { accessCodeList = [] } = userInfo || {};
  return (
    accessCodeList.indexOf('111-000-000') !== -1 ||
    accessCodeList.indexOf('111-111-000') !== -1 ||
    accessCodeList.indexOf('111-111-111') !== -1
  );
};

// 数字格式化 三位一逗号
export const formatNumer = num => {
  const str = num.toString();
  return str.replace(/(?!^)(?=(\d{3})+$)/g, ',');
};

const interfaceType = [get, post];
interfaceType[-1] = unknow;
const datasourceType = [
  'iconMySQL',
  'iconPostgreSQL',
  'iconOracle1',
  'iconMongoDB',
  'iconKingBase',
  'iconGBASE',
];
datasourceType[-1] = 'iconweizhiwenjian';
export const dataTypeIcon = [[unknow], interfaceType, [lua], datasourceType];

// byte => TB
export const Byte2TB = num => (num / 1024 / 1024 / 1024 / 1024).toFixed(2);
// byte => GB
export const Byte2GB = num => (num / 1024 / 1024 / 1024).toFixed(2);
// byte => MB
export const Byte2MB = num => (num / 1024 / 1024).toFixed(2);
// byte => KB
export const Byte2KB = num => (num / 1024).toFixed(2);

export const Byte2AllB = num => {
  if (Byte2KB(num) > 1024) {
    if (Byte2MB(num) > 1024) {
      if (Byte2GB(num) > 1024) {
        return `${Byte2TB(num)} TB`;
      }
      return `${Byte2GB(num)} GB`;
    }
    return `${Byte2MB(num)} MB`;
  }
  return `${Byte2KB(num)} KB`;
};

export const MB2GB = num => {
  if (num > 1024) {
    return `${(num / 1024).toFixed(0)}GB`;
  }

  return `${num} MB`;
};

export const share = () => {
  const url = window.location.href;
  const oInput = document.createElement('input');
  oInput.value = url;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand('Copy');
  oInput.className = 'oInput';
  oInput.style.display = 'none';
  message.success('数据链接复制成功，可以通过链接快速访问');
};

// eslint-disable-next-line
export const replaceName = name => name.replace(/[\\ \/=]/g, '');

export const toFixPrice = (price = 0) => {
  let value = parseFloat(price / 100).toLocaleString();
  const xsd = value.toString().split('.');
  if (xsd.length === 1) {
    value = `${value.toString()}.00`;
    return value;
  }
  if (xsd.length > 1) {
    if (xsd[1].length < 2) {
      // value = value.toString() + '0';
      value = `${value.toString()}0`;
    }
    return value;
  }

  return value;
};
// parseFloat((price / 100).toLocaleString().match(/^\d+(?:\.\d{0,2})?/);

export const getValueFromList = (key, list) => {
  const item = list.filter(items => items.key === key);
  return item.length === 0 ? '-' : item[0].value;
};

export const getValuesByKeys = (arr = [], keys = []) => {
  if (keys === null) return [];
  if (arr.length === 0) return [];

  return arr.filter(({ key }) => keys.includes(key)).map(({ value }) => value);
};

export const throttle = (func, delay = 1000) => {
  let prev = Date.now();
  return function() {
    const context = this;
    const now = Date.now();
    if (now - prev >= delay) {
      func.apply(context);
      prev = Date.now();
    } else {
      prev = Date.now();
    }
  };
};

export const getValidDuration = d => (d > 0 ? `${d}天` : '不限时');

export const getValidQuantity = q => (q > 0 ? `${q}次` : '不限次');

export const getValidCredit = c => toFixPrice(c);

export const getApplyTimer = (order_type, duration) =>
  order_type === ORDER_TYPE.credit
    ? getValidDuration(duration)
    : order_type === ORDER_TYPE.auth && duration > 0
    ? `${duration}天`
    : '永久';

export const getApplyCount = (order_type, count) =>
  order_type === ORDER_TYPE.credit
    ? getValidQuantity(count)
    : order_type === ORDER_TYPE.auth && count > 0
    ? `${count}次`
    : '不限';

export const getValidTimer = (order_type, info) =>
  order_type === ORDER_TYPE.credit
    ? getValidDuration(info.apply_duration)
    : order_type === ORDER_TYPE.auth && info.approve_duration > 0
    ? `${info.approve_duration}天`
    : '永久';

export const getValidCount = (order_type, info) =>
  order_type === ORDER_TYPE.credit
    ? getValidQuantity(info.apply_amount)
    : order_type === ORDER_TYPE.auth && info.approve_quantity > 0
    ? `${info.approve_quantity}次`
    : '不限';

export const getRoleAuth = (authAll, role) => {
  const currentList = authAll.filter(item => item.id === role);
  const current = currentList[0] || {};
  const { perm_settings = [] } = current;
  const checkedList = (perm_settings || [])
    .filter(li => li.checked === 1 || li.checked === 2)
    .map(item => item.id);

  return checkedList;
};

export const isJSON = str => {
  try {
    JSON.parse(str);

    return true;
  } catch (e) {
    console.log(e);

    return false;
  }
};
