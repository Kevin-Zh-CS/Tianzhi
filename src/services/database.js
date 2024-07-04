import promiseRequest from '@/utils/promiseRequest';
// 列出数据库
export async function databaseList({ namespace = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/list`,
  });
}

// 创建数据库
export async function createDatabase(params) {
  const { namespace, type, db_hash = '', ...other } = params;
  return promiseRequest({
    url:
      type === 'create'
        ? `/api/v2/${namespace}/database/${type}`
        : `/api/v2/${namespace}/database/update?namespace=${namespace}&db_hash=${db_hash}`,
    method: 'POST',
    data: { ...other },
  });
}
// 列出数据库已发布记录
export async function databaseRecords({
  namespace = '',
  dbHash = '',
  type = -1,
  beginTime = '',
  endTime = '',
  page = 1,
  size = 10,
  isAsc = true,
}) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/records?page=${page}&size=${size}&type=${type}&db_hash=${dbHash}&begin_time=${beginTime}&end_time=${endTime}&is_asc=${isAsc}`,
  });
}
// 删除数据库
export async function deleteDatabase({ namespace = '', dbHash = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/delete?namespace=${namespace}`,
    method: 'post',
    data: {
      db_hash: dbHash,
    },
  });
}
// 查看数据库详情
export async function databaseDetail({ namespace = '', dbHash = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/info?db_hash=${dbHash}`,
  });
}
// 查看数据库所属表
export async function tableList({ namespace = '', dbHash = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/tables?db_hash=${dbHash}`,
  });
}
// 查看mongo数据库所属表
export async function mongoTableList({ namespace = '', dbHash = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/mongo/collections?db_hash=${dbHash}`,
  });
}
// 查看数据库所属表所属列
export async function columnList({ namespace = '', dbHash = '', tableName = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/table/columns?db_hash=${dbHash}&table_name=${tableName}`,
  });
}
// 查询表数据
export async function tableDetailList({
  namespace = '',
  dbHash = '',
  tableName = '',
  fields,
  size = 10,
  page = 1,
}) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/table/list`,
    method: 'POST',
    data: {
      namespace,
      db_hash: dbHash,
      table_name: tableName,
      fields,
      // table: tableName,
      page,
      size,
    },
  });
}

// 查看mongo数据库所属表所属列和数据
export async function mongoList({
  namespace = '',
  dbHash = '',
  tableName = '',
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/mongo/docs?db_hash=${dbHash}&page=${page}&size=${size}`,
    method: 'POST',
    data: {
      collection: tableName,
      query: '',
    },
  });
}

// 查看mongo数据库所属表所属列和数据
export async function mongoListTotal({ namespace = '', dbHash = '', tableName = '' }) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/mongo/docs-num?db_hash=${dbHash}`,
    method: 'POST',
    data: {
      collection: tableName,
      query: '',
    },
  });
}

export async function getDatabaseList(namespace) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/list`,
  });
}

// 查看数据库所属表
export async function getTableList(namespace = '', dbHash = '') {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/tables?db_hash=${dbHash}`,
  });
}

// 查看数据库所属表所属列
export async function getColumnList(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/database/table/columns`,
    data,
  });
}
