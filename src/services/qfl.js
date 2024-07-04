import promiseRequest from '@/utils/promiseRequest';
import axios from 'axios';

export async function getLocalDataList(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/list`,
    method: 'get',
    data,
  });

  return res || {};
}

export async function getLocalDataDetail(data_id) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/info`,
    method: 'get',
    data: { data_id },
  });

  return res || {};
}

export async function getLocalDataRowList(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/rows/list`,
    method: 'get',
    data,
  });

  return res || {};
}

export async function deleteLocalData(data_id) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/delete?data_id=${data_id}`,
    method: 'post',
  });

  return res || {};
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

export async function downloadTemplate() {
  const data = await axios({
    method: 'get',
    url: `/api/v1/qfl/data/template`,
    responseType: 'blob',
    headers: { Authorization: `data-flow ${localStorage.getItem('token')}` },
  });
  download(data, '导入数据模版.csv');
}

// qfl/data/import

export async function addData(formData) {
  const res = await axios.post(`/api/v1/qfl/data/import`, formData, {
    headers: {
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
  });

  return res.data || {};
}

// /qfl/data/parser
export async function parserLocalData(template_list) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/parser`,
    method: 'post',
    data: { template_list },
  });

  return res || {};
}

export async function uploadLocalData(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/upload`,
    method: 'post',
    data,
  });

  return res || {};
}

// /qfl/data/header

export async function parserLocalHeaderData(data_id) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/header`,
    method: 'get',
    data: { data_id },
  });

  return res || {};
}

// /qfl/data/content

export async function parserLocalContent(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/content`,
    method: 'get',
    data,
  });

  return res || {};
}

export async function parserInfoContent(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/info-content`,
    method: 'get',
    data,
  });

  return res || {};
}

// /qfl/data/modify-column
export async function modifyLocalContent(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/modify-column`,
    method: 'post',
    data,
  });

  return res || {};
}

// /qfl/data/scan-missing

export async function scanLocalContent(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/scan-missing`,
    method: 'get',
    data,
  });

  return res || {};
}

// /qfl/data/delete-missing

export async function deleteMissingData(data) {
  const res = promiseRequest({
    url: `/api/v1/qfl/data/delete-missing`,
    method: 'post',
    data,
  });

  return res || {};
}

// /qfl/data/confirm

export async function addLocalData(data_id) {
  const res = await axios.post(
    `/api/v1/qfl/data/confirm?data_id=${data_id}`,
    {},
    {
      headers: {
        Authorization: `data-flow ${localStorage.getItem('token')}`,
      },
    },
  );

  return res || {};
}

// 创建项目
// /api/v1/qfl/project/create
export async function createProject(data) {
  const res = promiseRequest({
    url: '/api/v1/qfl/project/create',
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/list
export async function getProjectList(data) {
  const res = promiseRequest({
    url: '/api/v1/qfl/project/list',
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/info
export async function getProjectInfo(data) {
  const res = promiseRequest({
    url: '/api/v1/qfl/project/info',
    method: 'get',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/update
export async function updateProject(data) {
  const res = promiseRequest({
    url: '/api/v1/qfl/project/update',
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/delete

export async function deleteProject(project_id) {
  const res = promiseRequest({
    url: '/api/v1/qfl/project/delete',
    method: 'post',
    data: { project_id },
  });

  return res || {};
}
