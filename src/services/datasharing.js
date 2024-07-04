import promiseRequest from '@/utils/promiseRequest';

// 查看数据统计
export async function dataStatistic() {
  return promiseRequest({
    url: `/api/v2/datasharing/data/statistic`,
  });
}

// 查看数据列表
export async function orgList() {
  return promiseRequest({
    url: `/api/v2/datasharing/org/list`,
  });
}

// 查看数据详情
export async function dataDetail({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/detail?id=${dataId}`,
  });
}

// 按条件分页查找数据
export async function searchData(params, dispatch) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/search`,
    method: 'post',
    data: { ...params, size: 10 },
    dispatch,
  });
}

export async function getDataAmounts(params = {}) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/amounts`,
    method: 'post',
    data: { ...params },
  });
}

// 生成订单
export async function generateOrder({ dataId = '', duration = null, price = null }) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/generate`,
    method: 'POST',
    data: {
      data_id: dataId,
      duration,
      price,
    },
  });
}

// 确认订单
export async function confirmOrder({ orderId = '', duration = 0, reason = '' }) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/confirm`,
    method: 'POST',
    data: {
      order_id: orderId,
      duration,
      reason,
    },
  });
}

// 取消订单
export async function cancelOrder({ orderId = '' }) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/cancel`,
    method: 'POST',
    data: {
      order_id: orderId,
    },
  });
}

// 查看订单详情
export async function orderDetail({ orderId = '' }) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/detail?order_id=${orderId}`,
  });
}

// 分页列出作为数据申请方的授权订单
export async function authOrderByApplicant({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/applicant/auths`,
    method: 'POST',
    data: {
      od_status: odStatus,
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      page,
      size,
    },
  });
}

// 分页列出作为数据申请方的积分订单
export async function creditOrderByApplicant({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/applicant/credits`,
    method: 'POST',
    data: {
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      od_status: odStatus,
      page,
      size,
    },
  });
}

// 分页列出作为数据提供方的授权订单
export async function authOrderBySupplier({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/supplier/auths`,
    method: 'POST',
    data: {
      od_status: odStatus,
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      page,
      size,
    },
  });
}

// 分页列出作为数据提供方的积分订单
export async function creditOrderBySupplier({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/supplier/credits`,
    method: 'POST',
    data: {
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      od_status: odStatus,
      page,
      size,
    },
  });
}

// 审批作为数据提供方的订单
export async function approvalOrder({ orderId, duration = 0, pass = 0, reason }) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/supplier/approval`,
    method: 'POST',
    data: {
      order_id: orderId,
      duration,
      pass,
      reason,
    },
  });
}

// 下架数据
export async function offline({ id = '' }) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/offline?id=${id}`,
    method: 'POST',
  });
}

// 查找数据共享记录
export async function txRecordList({
  dataId = '',
  page = 1,
  size = 10,
  orgAddress = '',
  beginTime = '',
  endTime = '',
  isAsc = true,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/record/list?data_id=${dataId}&page=${page}&size=${size}&org_address=${orgAddress}&begin_time=${beginTime}&end_time=${endTime}&is_asc=${isAsc}`,
  });
}

/** 2021/9/7
 * @author: Yan.Wang
 * @description: 数据获取的公开订单
 */
export async function obtainPublishOrder({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/applicant/publics`,
    method: 'post',
    data: {
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      od_status: odStatus,
      page,
      size,
    },
  });
}

/** 2021/9/7
 * @author: Yan.Wang
 * @description: 数据交换-数据提供
 */
export async function providePublishOrder({
  odStatus = null,
  beginTime = null,
  endTime = null,
  dataName = '',
  dataType = null,
  orgName = null,
  page = 1,
  size = 10,
}) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/supplier/publics`,
    method: 'post',
    data: {
      begin_time: beginTime,
      end_time: endTime,
      data_name: dataName,
      data_type: dataType,
      org_name: orgName,
      od_status: odStatus,
      page,
      size,
    },
  });
}

// 查看数据详情
export async function dataDataSharingDetail(dataId) {
  return promiseRequest({
    url: `/api/v2/datasharing/data/detail?id=${dataId}`,
  });
}

// data_id
// page
// size
// org_address
// begin_time
// end_time
// is_asc
export async function getTxRecordList(data) {
  const {
    data_id = '',
    page,
    size,
    org_address = '',
    begin_time = '',
    end_time = '',
    is_asc = true,
  } = data;
  return promiseRequest({
    url: `/api/v2/datasharing/data/record/list?data_id=${data_id}&page=${page}&size=${size}&org_address=${org_address}&begin_time=${begin_time}&end_time=${end_time}&is_asc=${is_asc}`,
  });
}

// 查看数据列表
export async function getAllOrgList() {
  return promiseRequest({
    url: `/api/v2/datasharing/org/list`,
  });
}

export async function getDataStatistic() {
  return promiseRequest({
    url: `/api/v2/datasharing/data/statistic`,
  });
}

// order_id: orderId,
//       duration,
//       pass,
//       reason,
export async function approvalDataSharingOrder(data) {
  return promiseRequest({
    url: `/api/v2/datasharing/order/supplier/approval`,
    method: 'post',
    data,
  });
}

// duration price data_id
export async function generateDataSharingOrder(data) {
  return promiseRequest({
    method: 'post',
    url: `/api/v2/datasharing/order/generate`,
    data,
  });
}

export async function confirmDataSharingOrder(data) {
  return promiseRequest({
    method: 'post',
    url: `/api/v2/datasharing/order/confirm`,
    data,
  });
}

// order_id reason duration
