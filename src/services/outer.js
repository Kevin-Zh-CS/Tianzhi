import promiseRequest from '@/utils/promiseRequest';
import { requestDownload } from '@/utils/request';

// 列出外部资源库
// /api/v2/external-ns/list
export async function outerResourceList() {
  return promiseRequest({
    url: `/api/v2/external-ns/list`,
    method: 'GET',
  });
}

// 创建资源库
// /api/v2/external-ns/create
export async function outerResourceCreate({
  desc = '',
  name = '',
  privateType = 1,
  memberList = [],
}) {
  return promiseRequest({
    url: `/api/v2/external-ns/create`,
    method: 'POST',
    data: {
      name,
      desc,
      private_type: privateType,
      member_list: memberList,
    },
  });
}

// 删除资源库
// /api/v2/external-ns/delete
export async function outerResourceDelete(data) {
  return promiseRequest({
    url: `/api/v2/external-ns/delete`,
    method: 'post',
    data,
  });
}

// 查询资源库
// /api/v2/external-ns/info
export async function outerResourceInfo(namespace) {
  return promiseRequest({
    url: `/api/v2/external-ns/info?ns_id=${namespace}`,
    method: 'get',
  });
}

// 修改资源库
// /api/v2/external-ns/update
export async function outerResourceUpdate({
  desc = '',
  name = '',
  namespace = '',
  privateType = 2,
  memberList = [],
}) {
  return promiseRequest({
    url: `/api/v2/external-ns/update`,
    method: 'POST',
    data: {
      new_name: name,
      new_desc: desc,
      ns_id: namespace,
      private_type: privateType,
      member_list: memberList,
    },
  });
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

// 获取列表数据
// /api/v2/external-ns/data/list
export async function getResourceList(data) {
  const dataList = await promiseRequest({
    url: getTypeUrl(`/api/v2/external-ns/data/list`, data),
    method: 'get',
  });
  const dataLists = (dataList.list || []).map(item => ({ ...item, key: item.order_id }));
  return { list: dataLists, total: dataList.total || 0 };
}

// 查看数据详情（包括文件、模型、接口、数据源）复用datasharing接口
// /api/v2/datasharing/data/detail
// export async function dataDetail(id) {
//   return request(`/api/v2/datasharing/data/detail?id=${id}`);
// }

// 查看数据详情（包括文件、模型、接口、数据源
// /api/v2/external-ns/request-data/detail
export async function dataDetail(id, dispatch) {
  return promiseRequest({
    url: `/api/v2/external-ns/request-data/detail?order_id=${id}`,
    method: 'get',
    dispatch,
  });
}

// 数据删除
// /api/v2/external-ns/data/delete
export async function dataDelete(data) {
  return promiseRequest({
    url: `/api/v2/external-ns/data/delete`,
    method: 'post',
    data,
  });
}

// 数据的批量删除
// /api/v2/external-ns/data/batch-delete
export async function dataBatchDelete(data) {
  return promiseRequest({
    url: `/api/v2/external-ns/data/batch-delete`,
    method: 'post',
    data,
  });
}

// 文件下载
// /api/v2/external-ns/file/download
export async function downloadSingle(data) {
  return requestDownload(
    `/api/v2/external-ns/file/download?app_key=${data.app_key}&namespace=${data.namespace}`,
    {
      method: 'get',
    },
  );
}

// 文件远程下载
// /api/v2/external-ns/file/download
export async function downloadRemote(data) {
  return requestDownload(
    `/api/v2/external-ns/remote-file/download?app_key=${data.app_key}&location=${data.location}`,
    {
      method: 'get',
    },
  );
}

// 文件批量下载
// /api/v2/external-ns/file/tar-download
export async function downloadFile(data) {
  let params = `namespace=${data.namespace}`;
  // eslint-disable-next-line
  for (let i of data.names) {
    // eslint-disable-next-line
    params += '&names=' + i;
  }
  return requestDownload(`/api/v2/external-ns/file/tar-download?${params}`, {
    method: 'get',
  });
}

// 预览文件
// /api/v2/external-ns/file/view
export async function getFileView(data) {
  return requestDownload(
    `/api/v2/external-ns/file/view?app_key=${data.app_key}&namespace=${data.namespace}`,
    {
      method: 'get',
    },
  );
}
export function getFileUrl(data) {
  return `/api/v2/external-ns/file/view?app_key=${data.app_key}&namespace=${
    data.namespace
  }&token=data-flow ${localStorage.getItem('token')}`;
}

// 远程预览文件
// /api/v2/external-ns/remote-file/view
export async function remoteFileView(data) {
  return requestDownload(
    `/api/v2/external-ns/remote-file/view?app_key=${data.app_key}&location=${data.location}`,
    {
      method: 'get',
    },
  );
}
export function remoteFileUrl(data) {
  return `/api/v2/external-ns/remote-file/view?app_key=${data.app_key}&location=${
    data.location
  }&token=data-flow ${localStorage.getItem('token')}`;
}

// 模型的远程调用
// /api/v2/external-ns/model/remote/invoke
export async function invokeModel(data) {
  return promiseRequest({
    url: `/api/v2/external-ns/model/remote/invoke`,
    method: 'POST',
    data,
  });
}

// 接口的远程调用
// /api/v2/external-ns/restful/remote/invoke
export async function invokeInterface(data) {
  return promiseRequest({
    url: `/api/v2/external-ns/restful/remote/invoke`,
    method: 'POST',
    data,
  });
}
