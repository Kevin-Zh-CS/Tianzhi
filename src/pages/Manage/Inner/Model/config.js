import { Tag } from 'quanta-design';
import React from 'react';

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
};

const UPLOAD_STATUS_TAG = {
  '0': <Tag color="processing">上传中</Tag>,
  '1': <Tag color="warning">已暂停</Tag>,
  '2': <Tag color="success">已上传</Tag>,
  '3': <Tag color="error">已取消</Tag>,
};

const DOWNLOAD_STATUS_TAG = {
  '0': <Tag color="processing"> 下载中</Tag>,
  // '1': <Tag color="warning">已暂停</Tag>,
  '2': <Tag color="success">已下载</Tag>,
  '3': <Tag color="error">已取消</Tag>,
};

const PUBLISH_STATUS_TAG = {
  '0': <Tag color="warning">未发布</Tag>,
  '1': <Tag color="success">已发布</Tag>,
  '2': <Tag color="default">已下架</Tag>,
};

const DATA_THEME = [
  { key: 0, value: '科创信息' },
  { key: 1, value: '公共信息' },
  { key: 2, value: '资源信息' },
  { key: 3, value: '金融信息' },
  { key: 4, value: '隐私信息' },
];

const LUA_TYPE = ['int', 'double', 'string'];

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

export {
  UPLOAD_STATUS,
  UPLOAD_STATUS_TAG,
  PUBLISH_STATUS,
  PUBLISH_STATUS_TAG,
  PUBLISH_INIT_STATUS,
  DOWNLOAD_STATUS_TAG,
  DATA_THEME,
  LUA_TYPE,
  goDownload,
};
