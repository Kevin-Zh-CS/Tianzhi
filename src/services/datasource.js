import promiseRequest from '@/utils/promiseRequest';

// 创建数据源
export async function createDatasource({
  namespace = '',
  dbFields = [],
  dbHash = '',
  dbName = '',
  dbType = '',
  desc = '',
  extra = '',
  tableName = '',
  title = '',
}) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/create`,
    method: 'POST',
    data: {
      db_fields: dbFields,
      db_hash: dbHash,
      db_name: dbName,
      db_type: dbType,
      table_name: tableName,
      desc,
      extra,
      title,
    },
  });
}

// 删除数据源
export async function deleteDatasource({ namespace = '', hash = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/delete?namespace=${namespace}`,
    method: 'post',
    data: {
      ds_id: hash,
    },
  });
}

// 查看数据源详情
export async function datasourceDetail({ namespace = '', id = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/info?id=${id}`,
  });
}

// list出namespace下的所有数据源信息
export async function datasourceList({
  namespace = '',
  page = 1,
  size = 10,
  status = '',
  name = '',
  beginTime = '',
  endTime = '',
  isAsc = false,
}) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/list?is_asc=${isAsc}&page=${page}&size=${size}&status=${status}&name=${name}&begin_time=${beginTime}&end_time=${endTime}`,
  });
}

// 发布数据源
export async function publishDatasource({ namespace = '', fields = [], id = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/publish`,
    method: 'POST',
    data: {
      fields,
      id,
    },
  });
}

// 重命名数据源
export async function renameDatasource({ namespace = '', name = '', id = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/rename`,
    method: 'post',
    data: {
      name,
      id,
      namespace,
    },
  });
}

// 更新数据源
export async function updateDatasource(namespace, data, dispatch) {
  // return request(`/api/v2/${namespace}/data-source/update`, {
  //   method: 'POST',
  //   data: {
  //     title,
  //     id,
  //     data_topic: dataTopic,
  //     desc: dataDesc,
  //     is_auth: isAuth,
  //     is_private: isPrivate,
  //     need_approval: needApproval,
  //     prices,
  //     white_list: whiteList,
  //   },
  // });
  return promiseRequest({
    url: `/api/v2/${namespace}/data-source/update`,
    method: 'post',
    data,
    dispatch,
  });
}
