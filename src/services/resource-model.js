import promiseRequest from '@/utils/promiseRequest';
import { requestDownload } from '@/utils/request';
import request from 'umi-request';

// mkdir - 创建模型
export async function createModel(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/create`,
    method: 'post',
    data,
  });
}

// 获取列表数据
export async function getModelList(namespace, data) {
  const dataList = await promiseRequest({
    url: `/api/v2/${namespace}/model/list`,
    method: 'get',
    data,
  });
  const dataLists = (dataList.list || []).map(item => ({ ...item, key: item.id }));
  return { list: dataLists, total: dataList.total || 0 };
}

// /查看模型
export async function modeInfo(namespace, id, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/info?id=${id}`,
    method: 'get',
    dispatch,
  });
}

// /model/content/update - 更新模型内容
export async function updateModel(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/content/update`,
    method: 'post',
    data,
    dispatch,
  });
}

// /model/run [POST] - 运行模型
export async function runModel(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/run`,
    method: 'post',
    data,
    dispatch,
  });
}

// /v2/{namespace}/model/data/update [POST] - 模型数据信息更新
export async function updateDataModel(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/data/update`,
    method: 'post',
    data,
    dispatch,
  });
}
// /v2/{namespace}/model/auth-publish [POST] - 发布模型--TC
export async function publishModel(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/publish`,
    method: 'post',
    data,
    dispatch,
  });
}

// /api/v2/{namespace}/model/credit-publish
export async function creditModel(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/credit-publish`,
    method: 'post',
    data,
  });
}

// /auth-publish - 授权发布文件
export async function handleAuthPublish(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/file/auth-publish`,
    method: 'post',
    data,
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

const download = (res, names) => {
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

// /v2/{namespace}/model/download [GET] - 下载模型——TC
export async function downloadSingleModel(namespace, id, names) {
  const data = await requestDownload(`/api/v2/${namespace}/model/download?id=${id}`);
  download(data, names);
}

// /retrieve - 获取文件
// /v2/{namespace}/model/zip-download [GET] - 批量下载模型
export async function downloadSome(namespace, data) {
  let params = '';
  // eslint-disable-next-line
  for (let i of data) {
    if (i === 0) {
      // eslint-disable-next-line
      params += 'id=' + i;
    } else {
      // eslint-disable-next-line
      params += '&id=' + i;
    }
  }
  const res = await requestDownload(`/api/v2/${namespace}/model/zip-download?${params}`);
  const names = decodeURIComponent(
    res.response.headers
      .get('content-disposition')
      .split(';')[1]
      .split('=')[1],
  );
  download(res, names);
}

// 上传
export async function uploadModel(namespace, file) {
  const formData = new FormData();
  formData.append('file', file);
  return request(`/api/v2/${namespace}/model/upload`, {
    method: 'post',
    data: formData,
    headers: {
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
  });
}

// /v2/{namespace}/model/destroy [DELETE] - 销毁模型
export async function deleteModel(namespace, id) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/destroy`,
    method: 'post',
    data: { id, namespace },
  });
}

// /api/v2/{namespace}/model/batch-destroy 批量销毁
export async function deleteBatchModel(namespace, data) {
  const id = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < data.length; i++) {
    id.push(data[i]);
  }
  return promiseRequest({
    url: `/api/v2/${namespace}/model/batch-destroy`,
    method: 'post',
    data: {
      id,
      namespace,
    },
  });
}

// /v2/{namespace}/model/rename [POST] - 重命名模型——TC
export async function renameModel(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/model/rename`,
    method: 'post',
    data,
  });
}
