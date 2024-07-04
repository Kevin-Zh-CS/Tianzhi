import promiseRequest from '@/utils/promiseRequest';

// /api/v2/external-ns/obtain-data/list [GET]   - 列出当前账户下全部的已获取的数据
export async function getObtainList(data) {
  const res = promiseRequest({
    url: `/api/v2/external-ns/obtain-data/list`,
    method: 'post',
    data,
  });

  return res || [];
}

// /api/v2/external-ns/obtain-data/detail

export async function getObtainDetail(order_id, dispatch) {
  const res = promiseRequest({
    url: `/api/v2/external-ns/obtain-data/detail`,
    method: 'get',
    data: { order_id },
    dispatch,
  });

  return res || [];
}

export async function getRequestDetail(order_id, dispatch) {
  const res = promiseRequest({
    url: `/api/v2/external-ns/request-data/detail`,
    method: 'get',
    data: { order_id },
    dispatch,
  });

  return res || [];
}

// /api/v2/external-ns/list

export async function getExternalList({ order_id }) {
  const res = promiseRequest({
    url: `/api/v2/external-ns/list`,
    method: 'get',
    data: { order_id },
  });

  return res || [];
}

// 转存

export async function transfer(data, dispatch) {
  const res = promiseRequest({
    url: '/api/v2/external-ns/file/transfer',
    method: 'get',
    data,
    dispatch,
  });

  return res || [];
}

export async function getRecordList(data) {
  const res = await promiseRequest({
    url: `/api/v2/external-ns/obtain-data/req-record`,
    method: 'post',
    data,
  });

  return res || {};
}
