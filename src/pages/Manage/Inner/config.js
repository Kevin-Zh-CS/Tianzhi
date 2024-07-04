import { ReactComponent as jpgIcon } from '@/icons/jpg.svg';
import { ReactComponent as pngIcon } from '@/icons/png.svg';
import { ReactComponent as jpegIcon } from '@/icons/jpeg.svg';
import { ReactComponent as pdfIcon } from '@/icons/pdf.svg';
import { ReactComponent as wordIcon } from '@/icons/word.svg';
import { ReactComponent as pptIcon } from '@/icons/ppt.svg';
import { ReactComponent as excelIcon } from '@/icons/excel.svg';
import { ReactComponent as txtIcon } from '@/icons/txt.svg';
import { ReactComponent as mdIcon } from '@/icons/md.svg';
import { ReactComponent as mp4Icon } from '@/icons/mp4.svg';
import { ReactComponent as mp3Icon } from '@/icons/mp3.svg';
import { ReactComponent as csvIcon } from '@/icons/csv.svg';
import { ReactComponent as jsonIcon } from '@/icons/json.svg';
import { ReactComponent as xmlIcon } from '@/icons/xml.svg';
import { ReactComponent as rdfIcon } from '@/icons/rdf.svg';
import { ReactComponent as pyIcon } from '@/icons/py.svg';
import { ReactComponent as luaIcon } from '@/icons/lua.svg';
import { Tag } from 'quanta-design';
import axios from 'axios';
import React from 'react';
import { RES_TYPE } from '@/utils/enums';
import { ReactComponent as fileIcon } from '@/icons/file.svg';
import { ReactComponent as getIcon } from '@/icons/get.svg';
import { ReactComponent as postIcon } from '@/icons/post.svg';
import { ReactComponent as unknownIcon } from '@/icons/unknown_file.svg';
import { ReactComponent as videoIcon } from '@/icons/video.svg';

const PUBLISH_STATUS = [
  {
    key: 0,
    value: '未发布',
  },
  {
    key: 1,
    value: '已发布',
  },
  {
    key: 2,
    value: '已下架',
  },
];

const PUBLISH_INIT_STATUS = {
  init: 0,
  publish: 1,
  offline: 2,
  hasPublishFile: 3,
  noPublishFile: 4,
};

const UPLOAD_STATUS = {
  init: 0,
  stop: 1,
  success: 2,
  cancel: 3,
  fail: 4,
};

const UPLOAD_STATUS_TAG = {
  '0': <Tag color="processing">上传中</Tag>,
  '1': <Tag color="warning">已暂停</Tag>,
  '2': <Tag color="success">已上传</Tag>,
  '3': <Tag color="error">已取消</Tag>,
  '4': <Tag color="error">上传失败</Tag>,
};

const DOWNLOAD_STATUS_TAG = {
  '0': <Tag color="processing"> 下载中</Tag>,
  // '1': <Tag color="warning">已暂停</Tag>,
  '2': <Tag color="success">已下载</Tag>,
  '3': <Tag color="error">已取消</Tag>,
  '4': <Tag color="error">下载失败</Tag>,
};

const PUBLISH_STATUS_TAG = {
  '0': <Tag color="warning">未发布</Tag>,
  '1': <Tag color="success">已发布</Tag>,
  '2': <Tag color="default">已下架</Tag>,
};

function getAuthData(type) {
  let text = '-';
  switch (type) {
    case 1:
      text = '授权共享';
      break;
    case 2:
      text = '积分共享';
      break;
    case 3:
      text = '公开共享';
      break;
    default:
      text = '-';
      break;
  }
  return text;
}

const fileIconMap = [
  fileIcon,
  jpgIcon,
  pngIcon,
  jpegIcon,
  pdfIcon,
  wordIcon,
  pptIcon,
  excelIcon,
  txtIcon,
  mdIcon,
  mp4Icon,
  mp3Icon,
  csvIcon,
  jsonIcon,
  xmlIcon,
  rdfIcon,
  pyIcon,
  luaIcon,
  videoIcon,
  videoIcon,
];

const interfaceIconMap = [getIcon, postIcon];
interfaceIconMap[-1] = unknownIcon;

const fileTypeMap = [
  'unknown',
  'jpg',
  'png',
  'jpeg',
  'pdf',
  'word',
  'ppt',
  'excel',
  'txt',
  'markdown',
  'mp4',
  'mp3',
  'csv',
  'json',
  'xml',
  'rdf',
  'python',
  'lua',
  'mov',
  'avi',
];

const getTypeIndex = type => {
  let i = 0;
  switch (type.toLowerCase()) {
    case '.jpg':
      i = 1;
      break;
    case '.png':
      i = 2;
      break;
    case '.jpeg':
      i = 3;
      break;
    case '.pdf':
      i = 4;
      break;
    case '.doc':
    case '.docx':
      i = 5;
      break;
    case '.ppt':
    case '.pptx':
      i = 6;
      break;
    case '.xls':
    case '.xlsx':
      i = 7;
      break;
    case '.txt':
      i = 8;
      break;
    case '.md':
      i = 9;
      break;
    case '.mp4':
      i = 10;
      break;
    case '.mp3':
      i = 11;
      break;
    case '.csv':
      i = 12;
      break;
    case '.json':
      i = 13;
      break;
    case '.xml':
      i = 14;
      break;
    case '.rdf':
      i = 15;
      break;
    case '.py':
      i = 16;
      break;
    case '.lua':
      i = 17;
      break;
    case '.mov':
      i = 18;
      break;
    case '.avi':
      i = 19;
      break;
    default:
      i = 0;
      break;
  }
  return i;
};

const DATA_THEME = [
  { key: 0, value: '科创信息' },
  { key: 1, value: '公共信息' },
  { key: 2, value: '资源信息' },
  { key: 3, value: '金融信息' },
  { key: 4, value: '隐私信息' },
];

function getFileType(type) {
  let result;
  switch (type.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      result = 'image';
      break;
    case 'pdf':
      // case 'word':
      // case 'ppt':
      // case 'excel':
      // case 'csv':
      result = 'pdf';
      break;
    case 'mp3':
      result = 'audio';
      break;
    case 'mp4':
      result = 'video';
      break;
    case 'txt':
    case 'json':
    case 'md':
    case 'xml':
      result = 'text';
      break;
    default:
      result = 'unknown';
      break;
  }
  return result;
}

const goDownload = function(res) {
  const names = decodeURIComponent(
    res.response.headers
      .get('content-disposition')
      .split(';')[1]
      .split('=')[1],
  ); // 请求头中文件名
  const blob = new Blob([res.data]);
  const elink = document.createElement('a');
  elink.download = names;
  elink.style.display = 'none';
  elink.href = URL.createObjectURL(blob);
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href); // 释放URL 对象
  document.body.removeChild(elink);
};
const DATA_TYPE = [
  {
    key: 0,
    value: '文件',
  },
  {
    key: 1,
    value: '接口',
  },
  {
    key: 2,
    value: '模型',
  },
  {
    key: 3,
    value: '数据源',
  },
];

const PUB_TYPE = [
  {
    key: 1,
    value: '授权共享',
  },
  {
    key: 2,
    value: '积分共享',
  },
  {
    key: 3,
    value: '公开共享',
  },
];

const DATA_PUBLISH_TYPE = {
  file: '文件',
  interface: '接口',
  model: '模型',
  origin: '数据源',
};

const { CancelToken } = axios;
const source = CancelToken.source();
const getTopicsStr = function(topics) {
  return (topics || []).map(item => DATA_THEME[item].value);
};

const getKeyFromList = (list, key) => {
  const data = list.filter(item => item.key === key);
  return data[0]?.value;
};

const databaseTypeMap = {
  mongo: 'iconMongoDB',
  oracle: 'iconOracle1',
  mysql: 'iconMySQL',
  postgres: 'iconPostgreSQL',
};

const datasourceIconMap = [
  'iconMySQL',
  'iconPostgreSQL',
  'iconOracle1',
  'iconMongoDB',
  'iconKingBase',
  'iconGBASE',
];

const getFileIcon = (type, method) => {
  let result;
  switch (type) {
    case RES_TYPE.file:
      result = method ? fileIconMap[method] : fileIconMap[0];
      break;
    case RES_TYPE.interface:
      result = interfaceIconMap[method];
      break;
    case RES_TYPE.model:
      result = luaIcon;
      break;
    case RES_TYPE.origin:
      result = datasourceIconMap[method];
      break;
    default:
      result = 'unknown';
      break;
  }
  return result;
};

const validatorPrice = (rule, value, callback) => {
  const reg = /^\+?[0-9]\d*$/;
  if (value) {
    if (Number(value) < 0 || !reg.test(value)) {
      callback('请输入大于0的整数');
      return;
    }
    if (value > 9999999) {
      callback('请输入小于9999999的整数');
      return;
    }
  }
  callback();
};

const validatorPrices = (rule, value, callback) => {
  const reg = /^\+?[1-9]\d*$/;
  if (value) {
    if (Number(value) <= 0 || !reg.test(value)) {
      callback('请输入大于0的整数');
      return;
    }
    if (value > 9999999) {
      callback('请输入小于9999999的整数');
      return;
    }
  }
  callback();
};

const validatorInput = (rule, value, callback) => {
  if (value) {
    if (value > 9999999.99 || value < 0) {
      callback('请输入大于0且小于9999999.99的数字,保留两位小数');
    }
    if (!Number(value)) {
      callback('请输入大于0且小于9999999.99的数字,保留两位小数');
    }
    const arr = String(value).split('.');
    if (arr.length > 2 || (arr.length === 2 && (!arr[1].length || arr[1].length > 2))) {
      callback('请输入大于0且小于9999999.99的数字,保留两位小数');
    }
    callback();
  }
  callback();
};

export {
  UPLOAD_STATUS,
  UPLOAD_STATUS_TAG,
  PUBLISH_STATUS,
  fileIconMap,
  fileTypeMap,
  databaseTypeMap,
  PUBLISH_STATUS_TAG,
  PUBLISH_INIT_STATUS,
  DOWNLOAD_STATUS_TAG,
  DATA_THEME,
  DATA_TYPE,
  PUB_TYPE,
  DATA_PUBLISH_TYPE,
  source,
  getFileType,
  goDownload,
  getTypeIndex,
  getTopicsStr,
  getKeyFromList,
  getFileIcon,
  getAuthData,
  validatorPrice,
  validatorInput,
  validatorPrices,
};
