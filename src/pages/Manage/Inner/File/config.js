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
import { ReactComponent as unknownIcon } from '@/icons/unknown_file.svg';
import { ReactComponent as rdfIcon } from '@/icons/rdf.svg';
import { ReactComponent as pyIcon } from '@/icons/py.svg';
import { ReactComponent as luaIcon } from '@/icons/lua.svg';
import { ReactComponent as videoIcon } from '@/icons/video.svg';
import { ReactComponent as Notice } from '@/icons/notice.svg';
import { ReactComponent as Check } from '@/icons/check.svg';
import { Tag, IconBase } from 'quanta-design';
import axios from 'axios';
import React from 'react';
import styles from '@/pages/Message/index.less';

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

const MESSAGE_STATUS = [
  {
    key: 0,
    value: '未读',
  },
  {
    key: 1,
    value: '已读',
  },
];

const MESSAGE_TYPE = [
  {
    key: 0,
    value: '通知',
  },
  {
    key: 1,
    value: '待办',
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

// 0：通过-通知  1：驳回-通知  2：待审核-代办
const ICON_TYPE_TAG = {
  '2': <IconBase icon={Notice} fill="#08CB94" className={styles.iconItem} />,
  '3': <IconBase icon={Notice} fill="#E53B43" className={styles.iconItem} />,
  '1': <IconBase icon={Check} fill="#FFAD32" className={styles.iconItem} />,
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

const Message_STATUS_TAG = {
  '0': <Tag color="warning">未读</Tag>,
  '1': <Tag color="default">已读</Tag>,
};

const fileIconMap = [
  unknownIcon,
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
  const names = decodeURIComponent(res.headers['content-disposition'].split(';')[1].split('=')[1]); // 请求头中文件名
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

const { CancelToken } = axios;
const source = CancelToken.source();

export {
  UPLOAD_STATUS,
  UPLOAD_STATUS_TAG,
  PUBLISH_STATUS,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
  fileIconMap,
  fileTypeMap,
  PUBLISH_STATUS_TAG,
  PUBLISH_INIT_STATUS,
  Message_STATUS_TAG,
  ICON_TYPE_TAG,
  DOWNLOAD_STATUS_TAG,
  DATA_THEME,
  source,
  getFileType,
  goDownload,
  getTypeIndex,
};
