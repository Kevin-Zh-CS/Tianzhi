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
import { ReactComponent as Lua, ReactComponent as luaIcon } from '@/icons/lua.svg';
import { ReactComponent as datasourceIcon } from '@/icons/datasource.svg';
import { ReactComponent as fileIcon } from '@/icons/file.svg';
import { Tag, message } from 'quanta-design';
import { RES_TYPE } from '@/utils/enums';
import React from 'react';
import { ReactComponent as Get } from '@/icons/get.svg';
import { ReactComponent as PostIcon } from '@/icons/post.svg';
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
    value: '已下线',
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
  '2': <Tag color="success">已下载</Tag>,
  '3': <Tag color="error">已取消</Tag>,
  '4': <Tag color="error">下载失败</Tag>,
};

const PUBLISH_STATUS_TAG = {
  '0': <Tag color="warning">未发布</Tag>,
  '1': <Tag color="success">已发布</Tag>,
  '2': <Tag color="error">已下线</Tag>,
};

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

const interfaceIconMap = [Get, PostIcon];
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
  switch (type && type.toLowerCase()) {
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
  switch (type && type.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      result = 'image';
      break;
    case 'pdf':
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
  if (res.response.headers.get('content-disposition')) {
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
  } else {
    message.error('网络错误');
  }
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
  {
    key: 4,
    value: '数据库',
  },
  {
    key: 5,
    value: '数据导入',
  },
  {
    key: 6,
    value: '信息摘要',
  },
];

const TITLE_TYPE = [
  {
    key: 0,
    value: '文件管理',
  },
  {
    key: 1,
    value: '接口管理',
  },
  {
    key: 2,
    value: '模型管理',
  },
  {
    key: 3,
    value: '数据源管理',
  },
];

// '', '下载文件', '预览文件', '转存文件', '调用模型', '调用接口', '调用数据源'
const requestRecordTypeEnum = [
  {
    key: 1,
    value: '下载文件',
  },
  {
    key: 2,
    value: '预览文件',
  },
  {
    key: 3,
    value: '转存文件',
  },
  {
    key: 4,
    value: '调用模型',
  },
  {
    key: 5,
    value: '调用接口',
  },
  {
    key: 6,
    value: '调用数据源',
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

const ORDER_SUCCESS_LIST = [
  {
    title: '获取成功',
    desc: '您所在的机构目前处于该数据的授权名单中，已获取永久调用权限。',
  },
  {
    title: '审核通过',
    desc: '数据提供方审核通过，您所在的机构可在有效期内请求该数据。',
  },
  {
    title: '已支付',
    desc: '支付成功，已拿到数据访问凭证，可在有效期内请求该数据。',
  },
  {
    title: '获取成功',
    desc: '该数据为公开数据，已获取永久使用权限。',
  },
];

const getTopicsStr = function(topics) {
  return (topics || []).map(item => (
    <span style={{ marginRight: 8 }} key={item.key}>
      {DATA_THEME[item].value}
    </span>
  ));
};

const getFileIcon = (type, method) => {
  let result;
  switch (type) {
    case RES_TYPE.file:
      result = fileIconMap[method];
      break;
    case RES_TYPE.interface:
      result = interfaceIconMap[method];
      break;
    case RES_TYPE.model:
      result = luaIcon;
      break;
    case RES_TYPE.database:
      result = datasourceIcon;
      break;
    default:
      result = 'unknown';
      break;
  }
  return result;
};

const datasourceIconMap = [
  'iconMySQL',
  'iconPostgreSQL',
  'iconOracle1',
  'iconMongoDB',
  'iconKingBase',
  'iconGBASE',
];
datasourceIconMap[-1] = 'iconweizhiwenjian';
const dataTypeMap = [fileIconMap, interfaceIconMap, Lua, datasourceIconMap];

export {
  UPLOAD_STATUS,
  UPLOAD_STATUS_TAG,
  PUBLISH_STATUS,
  fileIconMap,
  fileTypeMap,
  PUBLISH_STATUS_TAG,
  PUBLISH_INIT_STATUS,
  DOWNLOAD_STATUS_TAG,
  DATA_THEME,
  DATA_TYPE,
  TITLE_TYPE,
  PUB_TYPE,
  ORDER_SUCCESS_LIST,
  getFileType,
  getTypeIndex,
  goDownload,
  getTopicsStr,
  getFileIcon,
  dataTypeMap,
  requestRecordTypeEnum,
};
