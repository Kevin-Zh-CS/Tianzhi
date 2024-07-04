import axios from 'axios';
import promiseRequest from '@/utils/promiseRequest';
import { requestDownload } from '@/utils/request';
// import { source } from '@/pages/Manage/Inner/File/config';

// const { CancelToken } = source;
// 列出资源库
export async function resourceList() {
  return promiseRequest(`/api/v2/resource/list-ns`, {
    url: `/api/v2/resource/list-ns`,
  });
}
// 搜索成员
export async function searchMembers({ resourceId, ns_id, page = 1, size = -1, keywords = '' }) {
  return promiseRequest({
    url: `/api/v2/authority/search-members`,
    method: 'get',
    data: {
      page,
      size,
      keywords,
      resource_id: resourceId,
      ns_id,
    },
  });
}
// 创建资源库
export async function resourceCreate({ desc = '', name = '', privateType = 1, members = [] }) {
  return promiseRequest({
    url: `/api/v2/resource/create-ns`,
    method: 'POST',
    data: {
      name,
      desc,
      private_type: privateType,
      member_list: members,
    },
  });
}
// 删除资源库
export async function resourceDelete({ namespace = '' }) {
  return promiseRequest({
    url: `/api/v2/resource/delete-ns?ns_id=${namespace}`,
    method: 'POST',
  });
}
// 查询资源库
export async function resourceInfo({ namespace = '' }) {
  return promiseRequest({
    url: `/api/v2/resource/info?ns_id=${namespace}`,
  });
}
// 修改资源库
export async function resourceUpdate({
  desc = '',
  name = '',
  namespace = '',
  privateType = 2,
  members = [],
}) {
  return promiseRequest({
    url: `/api/v2/resource/modify-ns`,
    method: 'POST',
    data: {
      new_name: name,
      new_desc: desc,
      ns_id: namespace,
      private_type: privateType,
      member_list: members,
    },
  });
}
// 查询资源/资源库成员
export async function getMemberList({
  resource_id = '',
  ns_id,
  page = 1,
  size = 10,
  keywords = '',
  is_time_desc = null,
}) {
  return promiseRequest({
    url: `/api/v2/authority/list-members`,
    method: 'post',
    data: {
      page,
      size,
      resource_id,
      ns_id,
      keywords,
      is_time_desc,
    },
  });
}
// 查询资源/资源库成员
export async function modifyMember({ resource_id = '', ns_id, address, role }) {
  return promiseRequest({
    url: `/api/v2/authority/modify-member`,
    method: 'post',
    data: {
      address,
      role,
      resource_id,
      ns_id,
    },
  });
}
// 批量为资源添加成员
export async function addMember({ resource_id = '', ns_id, members }) {
  return promiseRequest({
    url: `/api/v2/authority/add-members`,
    method: 'post',
    data: {
      members,
      resource_id,
      ns_id,
    },
  });
}
// 获取角色-权限信息
export async function getAuth({ resource_id = '', ns_id }) {
  const res = await promiseRequest({
    url: `/api/v2/authority/get-auth`,
    method: 'get',
    data: {
      resource_id,
      ns_id,
    },
  });
  const { perm_category } = res;
  const checkedList = (perm_category?.perm_settings || [])
    .filter(li => li.checked === 1 || li.checked === 2)
    .map(item => item.id);

  return checkedList;
}

const isTrueData = data => data !== null && data !== '' && data !== undefined;
const getTrueData = data => {
  const params = {};
  // eslint-disable-next-line
  for (let key in data) {
    if (isTrueData(data[key])) params[key] = data[key];
  }
  return params;
};
const getTypeUrl = (url, data) => {
  const uri = Object.entries(getTrueData(data))
    .map(res => (res[1] !== undefined ? `${res[0]}=${res[1]}` : ''))
    .join('&');
  return `${url}?${uri}`;
};

// mkdir - 创建文件夹
export async function mkdirFile(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/mkdir`,
    method: 'post',
    data,
  });
}

// 获取列表数据
export async function getResourceList(namespace, data) {
  const dataList = await promiseRequest({
    url: `/api/v2/${namespace}/file/list`,
    method: 'get',
    data,
  });
  const dataLists = (dataList.file_list || []).map(item => ({ ...item, key: item.name }));
  return {
    list: dataLists,
    total: dataList.total || 0,
    folderAuth: !!dataList.file_list,
    resourceId: dataList.resource_id || '',
  };
}

// /add - 上传文件(支持断点续传)
export async function addFile(namespace, params, file, onUploadProgress) {
  return axios.post(getTypeUrl(`/api/v2/${namespace}/file/add`, params), file, {
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
    onUploadProgress,
  });
}

// /api/v2/{namespace}/file/rm
export async function rmFile(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/rm`,
    method: 'post',
    data,
  });
}

// /api/v2/{namespace}/file/rename
export async function renameFile(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/rename`,
    method: 'post',
    data,
  });
}

// /stat
export async function fileInfo(namespace, dir, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/stat?path=${encodeURIComponent(dir)}`,
    method: 'get',
    dispatch,
  });
}

// /auth-publish - 授权发布文件
export async function handleAuthPublish(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/publish`,
    method: 'post',
    data,
    dispatch,
  });
}

// /credit-publish - 积分发布文件
export async function handleCreditPublish(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/credit-publish`,
    method: 'post',
    data,
  });
}

export async function getDataDetail(dataId = '') {
  return promiseRequest({
    url: `/api/v2/datasharing/data/detail?id=${dataId}`,
    method: 'get',
  });
}

export async function getSearchList() {
  const data = await promiseRequest({
    url: '/api/v2/datasharing/org/list',
    method: 'get',
  });
  const dataList = (data.list || []).filter(item => item.is_self === 0);
  return dataList;
}

// /tar-download - 下载文件压缩包
export async function downloadFile(namespace, data, onDownloadProgress) {
  let params = `dir=${encodeURIComponent(data.dir)}`;
  // eslint-disable-next-line
  for (let i of data.names) {
    // eslint-disable-next-line
    params += '&names=' + i;
  }
  return axios({
    method: 'get',
    url: `/api/v2/${namespace}/file/tar-download?${params}`,
    responseType: 'blob',
    headers: { Authorization: `data-flow ${localStorage.getItem('token')}` },
    onDownloadProgress,
  });
}

// /retrieve - 获取文件

export async function downloadSingle(namespace, data, onDownloadProgress) {
  const params = `path=${encodeURIComponent(data.dir)}&is_view=false`;
  return axios({
    method: 'get',
    url: `/api/v2/${namespace}/file/retrieve?${params}`,
    responseType: 'blob',
    headers: { Authorization: `data-flow ${localStorage.getItem('token')}` },
    onDownloadProgress,
  });
}

export function getFileUrl(namespace, dir) {
  const params = `path=${encodeURIComponent(dir)}&is_view=true`;
  return `/api/v2/${namespace}/file/retrieve?${params}&token=data-flow ${localStorage.getItem(
    'token',
  )}`;
}

export async function getFileTxt(namespace, dir) {
  const params = `path=${encodeURIComponent(dir)}&is_view=true`;
  return requestDownload(`/api/v2/${namespace}/file/retrieve?${params}`, {
    method: 'get',
  });
}

export async function getFileView(namespace, dir) {
  const params = `path=${encodeURIComponent(dir)}&is_view=true`;
  return requestDownload(
    `/api/v2/${namespace}/file/retrieve?token=data-flow ${localStorage.getItem('token')}&${params}`,
    {
      method: 'get',
    },
  );
}

export async function interrupt(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/interrupt`,
    method: 'post',
    data,
  });
}

// /api/v1/data/update-whitelist更新发布数据的授权名单

export async function updateWhitelist(data) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/update-whitelist`,
    method: 'post',
    data,
  });
}

// 编辑

export async function updateFile(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/update`,
    method: 'post',
    data,
    dispatch,
  });
}

// /cancel-upload - 取消上传
export async function cancelUpload(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/cancel-upload`,
    method: 'post',
    data,
  });
}

// /cancel-download - 取消下载
export async function cancelDownload(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/cancel-download`,
    method: 'post',
    data,
  });
}

// /data/offline
export async function setOffline(id) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/offline`,
    method: 'post',
    data: {
      id,
    },
  });
}

// /api/v2/resource/list-ns
export async function getSourceList() {
  const res = promiseRequest({
    url: `/api/v2/resource/list-ns`,
    method: 'get',
  });
  return res || [];
}

export async function getSourcePublishList(data) {
  const res = promiseRequest({
    url: `/api/v2/internal-ns/data/list`,
    method: 'get',
    data,
  });

  return res || [];
}

export async function getTableList(namespace, data, dispatch) {
  const res = promiseRequest({
    url: `/api/v2/${namespace}/database/table/list`,
    method: 'post',
    data,
    dispatch,
  });

  return res || {};
}

// /api/v2/datasharing/data/update-packages

export async function updatePackages(data) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/update-packages`,
    method: 'post',
    data,
  });
}
