import request, { requestDownload } from '@/utils/request';
import request1 from 'umi-request';
import promiseRequest from '@/utils/promiseRequest';

// 删除导入数据
export async function deleteData({ namespace = '', ...data }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data`,
    method: 'post',
    data,
  });
}
// 查询导入数据信息
export async function dataInfo({ namespace = '', dataId = '' }) {
  return request(`/api/v2/importer/${namespace}/data/info?id=${dataId}`);
}

export async function getNewImportDataInfo({ namespace = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/info?id=${dataId}`,
  });
}

// 删除导入数据
export async function updateInfo({ namespace = '', id = '', dataName = '', dataDesc = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/info/update?id=${id}&data_name=${dataName}&data_desc=${dataDesc}`,
    method: 'POST',
  });
}

export async function getImporterDataInfo({ namespace = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/info?id=${dataId}`,
    method: 'get',
  });
}
// 查询导入数据信息列表
export async function dataList({
  namespace = '',
  page = 1,
  size = 10,
  isTimeDesc = true,
  taskId = '',
  type = '0',
}) {
  // const res = await request(
  //   `/api/v2/importer/${namespace}/data/list?page=${page}&size=${size}&is_time_desc=${isTimeDesc}`,
  // );
  // return res.data;
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/list`,
    data: { page, size, is_time_desc: isTimeDesc, task_id: taskId, type },
  });
}
// 添加数据条目
export async function addData({ namespace = '', id = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/rows/add?id=${id}`,
    method: 'POST',
  });
}
// 删除数据条目
export async function deleteRow({ namespace = '', id = '', elements = [] }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/rows/delete`,
    method: 'post',
    data: {
      id,
      namespace,
      records: elements,
    },
  });
}
// 读取数据
export async function dataRowList({
  namespace = '',
  dataId = '',
  fields = [],
  page = 1,
  size = 10,
}) {
  console.log(namespace);
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/rows/list`,
    method: 'POST',
    data: {
      data_id: dataId,
      fields,
      page,
      size,
    },
  });
}

export async function getLists({ namespace = '', data_id = '', fields = [], page = 1, size = 10 }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/rows/list`,
    method: 'post',
    data: {
      data_id,
      fields,
      page,
      size,
    },
  });
}
// 更新数据条目
export async function updateRow({ namespace = '', id = '', elements = [] }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/rows/update?id=${id}`,
    method: 'POST',
    data: {
      elements,
    },
  });
}
/* 下载批量数据导入模板 */
export async function template() {
  return requestDownload(`/api/v2/importer/template`);
}
// 列出临时表内的参数信息
export async function argsList({ namespace = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/args?data_id=${dataId}`,
  });
}
// 分页列出临时表内的数据
export async function contentList({ namespace = '', dataId = '', page = 1, size = 10 }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/content?data_id=${dataId}&page=${page}&size=${size}`,
  });
}
// 修改数据类型
export async function modifyColumn({ namespace = '', id = '', name = '', newType = 0 }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/modify-column`,
    method: 'POST',
    data: {
      data_id: id,
      name,
      new_type: newType,
    },
  });
}
// 返回临时表内缺失字段的总体情况
export async function missingContent({ namespace = '', dataId = '', page = 1, size = 5 }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/missing/content?data_id=${dataId}&page=${page}&size=${size}`,
  });
}

// 删除数据行
export async function deleteMissing({
  namespace = '',
  dataId = '',
  select_all_missing = true,
  target_row_list = [],
}) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/delete-missing?namespace=${namespace}`,
    method: 'post',
    data: {
      data_id: dataId,
      select_all_missing,
      target_row_list,
    },
  });
}
// 确认导入数据，写入bxm
export async function confirmData({ namespace = '', dataId = '' }) {
  return request(`/api/v2/importer/${namespace}/prepare/confirm-data?data_id=${dataId}`, {
    method: 'POST',
  });
}
// 导入数据库
export async function importDatabase({
  namespace = '',
  colNames = [],
  dbHash = '',
  desc = '',
  isImport = true,
  name = '',
  tableName = '',
}) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/db`,
    method: 'POST',
    data: {
      col_names: colNames,
      db_hash: dbHash,
      desc,
      is_import: isImport,
      name,
      table_name: tableName,
    },
  });
}
// 查询导入数据关联的隐私计算任务信息
export async function relatedTaskInfo({ namespace = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/task?data_id=${dataId}`,
  });
}

export async function handleConfirmData(namespace = '', formData) {
  const res = await request1(`/api/v2/importer/${namespace}/prepare/file`, {
    method: 'post',
    data: formData,
    requestType: 'form',
    headers: {
      Authorization: `data-flow ${localStorage.getItem('token')}`,
    },
  });
  return res || {};
}

// 导入数据库
export async function handleImportDatabase(namespace = '', data) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/db`,
    method: 'post',
    data,
  });
}

// 分页列出临时表内的数据
export async function getContentList(namespace = '', data) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/content`,
    method: 'get',
    data,
  });
}

// 列出临时表内的参数信息
export async function getArgsList(namespace = '', data_id = '') {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/args?data_id=${data_id}`,
    method: 'get',
  });
}

// 修改数据类型
export async function handleModifyColumn(namespace = '', data) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/modify-column`,
    method: 'post',
    data,
  });
}

// 返回临时表内缺失字段的总体情况
export async function getMissingContent(namespace = '', data) {
  // return request(
  //   `/api/v2/importer/${namespace}/prepare/missing/content?data_id=${dataId}&page=${page}&size=${size}`,
  //   {},
  // );

  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/missing/content`,
    method: 'get',
    data,
  });
}

export async function handleDeleteMissing(namespace = '', data) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/prepare/delete-missing?namespace=${namespace}`,
    method: 'post',
    data,
  });
}
