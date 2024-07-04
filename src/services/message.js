import promiseRequest from '@/utils/promiseRequest';

// 获取未读消息的数量
// /api/v2/message/query-unread
export async function getUnReadNum() {
  return promiseRequest({
    url: `/api/v2/message/query-unread`,
    method: 'get',
    data: { msg_status: 0 },
  });
}

// 获取消息列表
// /api/v2/message/list
export async function getMessageList(data) {
  const dataList = await promiseRequest({
    url: `/api/v2/message/list`,
    method: 'get',
    data,
  });
  const dataLists = (dataList.list || []).map(item => ({ ...item, key: item.msg_id }));
  return { list: dataLists, total: dataList.total || 0 };
}

// 标记信息已读
// /api/v2/message/batch-flip-status
export async function markMessageRead(id) {
  return promiseRequest({
    url: '/api/v2/message/batch-flip-status',
    method: 'get',
    data: {
      id,
      msg_status: 1,
    },
  });
}

//  删除消息
// /api/v2/message/batch-delete
export async function messageDestroy(id) {
  return promiseRequest({
    method: 'post',
    url: '/api/v2/message/batch-delete',
    data: { id },
  });
}

// 后端不断轮询的接口
export async function getNotification() {
  const dataList = await promiseRequest({
    url: `/api/v2/message/query-unalert`,
    method: 'get',
    data: {
      is_alert: 0,
      page: 1,
      size: 10,
    },
  });
  const dataLists = (dataList?.list || []).map(item => ({ ...item, key: item.msg_id }));
  return { list: dataLists, total: dataList?.total || 0 };
}

// 置为已弹窗
// /api/v2/message/batch-flip-alert
export async function flipAlter(id) {
  await promiseRequest({
    url: `/api/v2/message/batch-flip-alert`,
    method: 'get',
    data: {
      id,
      is_alert: 1,
    },
  });
}
