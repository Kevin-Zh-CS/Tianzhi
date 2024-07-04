import promiseRequest from '@/utils/promiseRequest';
import axios from 'axios';
// import axios from 'axios';

// /api/v1/qfl/model/list [GET]  - 模型列表
export async function getModelList(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/list`,
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/list [GET]  - 列出某个模型的所有版本
export async function getModelVersionList(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/list`,
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/restore [POST]  -对某个模型版本进行恢复，使其变成当前版本
export async function restoreModelVersion(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/restore`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/delete [POST]  -对某个模型版本进行删除
export async function deleteModelVersion(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/delete`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/import[POST]

export async function importModel(formData) {
  const res = await axios.post(`/api/v1/qfl/model/import`, formData, {
    headers: {
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
  });

  return res.data || {};
}

// /api/v1/qfl/model/version/import [POST]  -对之前本地导入的模型再导入一个创建新的版本

export async function importModelVersion(formData) {
  const res = await axios.post(`/api/v1/qfl/model/version/import`, formData, {
    headers: {
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
  });

  return res.data || {};
}

// /api/v1/qfl/model/info[GET]  - 模型基本信息
export async function getModelInfo(model_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/info`,
    method: 'get',
    data: { model_id },
  });

  return res || {};
}

export async function getModelingInfo(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/info`,
    method: 'get',
    data,
  });
  return res || {};
}

// /api/v1/qfl/model/update[POST]  - 更新模型信息(基本信息和配置信息)
export async function updateModel(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/update`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/create [POST]  -对之前本地导入的模型，确认后创建新版本
export async function createModelVersion(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/create`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/save [POST]  -将模型另存为到模型管理模块
export async function saveModel(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/save`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/targets[GET]  - 列出这个job输出的模型，可保存的所有目标版本.
export async function getModelVersionTargets(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/targets`,
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/version/update [POST]  -对某个模型目标进行版本的更新
export async function updateVersionModel(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/version/update`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/delete[POST]  - 删除模型记录
export async function deleteModel(model_ids) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/delete`,
    method: 'post',
    data: { model_ids },
  });

  return res || {};
}

// /api/v1/qfl/model/content[GET]  - 获取导入的模型内容
export async function getModelContent(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/content`,
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/favorite[POST]  - 收藏模型
export async function handleFavorite(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/model/favorite`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/model/download [POST]  -下载模型：安全建模、本地导入详情
export async function downloadModel(data) {
  return axios({
    method: 'post',
    url: `/api/v1/qfl/model/download`,
    data,
    responseType: 'blob',
    headers: { Authorization: `data-flow ${localStorage.getItem('token')}` },
  });
}
