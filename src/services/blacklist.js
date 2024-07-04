import { requestDownload } from '@/utils/request';
import promiseRequest from '@/utils/promiseRequest';

/* 获取机构信息
 */
export async function orgList() {
  return promiseRequest({
    url: `/api/v2/org/list`,
  });
}

// 黑名单查询
export async function query(params) {
  return promiseRequest({
    url: '/api/v2/blacklist/query',
    method: 'POST',
    data: params,
  });
}
// 黑名单历史记录 最新记录查询-本机构
export async function latestRecord() {
  return promiseRequest({
    url: `/api/v2/blacklist/record/local?is_time_desc_order=true&page=1&size=3`,
  });
}
// 黑名单历史记录 实时操作
export async function recentRecord() {
  return promiseRequest({
    url: `/api/v2/blacklist/recent?is_time_desc_order=true&page=1&size=3`,
  });
}
// 黑名单历史记录 分页查询-本机构
export async function localRecord(sort = true, page = 1, size = 10, caller = '', type = -1) {
  return promiseRequest({
    url: `/api/v2/blacklist/record/local?is_time_desc_order=${sort}&page=${page}&size=${size}&caller_name=${encodeURIComponent(
      caller,
    )}&query_type=${type}`,
  });
}
// 黑名单历史记录 分页查询-其他机构
export async function otherRecord(sort = true, page = 1, size = 10, org = '', type = -1) {
  return promiseRequest({
    url: `/api/v2/blacklist/record/other?is_time_desc_order=${sort}&page=${page}&size=${size}&org_name=${encodeURIComponent(
      org,
    )}&query_type=${type}`,
  });
}
// 黑名单历史记录 分页查询总数-本机构
export async function localRecordCount(caller = '', type = -1) {
  return promiseRequest({
    url: `/api/v2/blacklist/record/local/count?caller_name=${encodeURIComponent(
      caller,
    )}&query_type=${type}`,
  });
}
// 黑名单历史记录 分页查询总数-其他机构
export async function otherRecordCount(org = '', type = -1) {
  return promiseRequest({
    url: `/api/v2/blacklist/record/other/count?org_name=${encodeURIComponent(
      org,
    )}&query_type=${type}`,
  });
}
// 结果下载
export async function download(params) {
  return requestDownload(`/api/v2/blacklist/record/batch?record_id=${params}`);
}
// 下载黑名单查询模版
export async function template() {
  return requestDownload(`/api/v2/blacklist/template`);
}
// 获取黑名单应用统计信息
export async function info() {
  return promiseRequest({
    url: `/api/v2/blacklist/info`,
  });
}

// /api/v2/credit-ledger/list 搜索/列出机构的交易流水
export async function creditLedgerList(data) {
  return promiseRequest({
    url: `/api/v2/credit-ledger/list`,
    method: 'get',
    data,
  });
}

// /api/v2/credit-ledger/org/balance -查询机构的积分余额

export async function creditLedgerBalanceList(data, dispatch) {
  const dataList = await promiseRequest({
    url: `/api/v2/credit-ledger/org/latest-balances`,
    method: 'get',
    data,
    dispatch,
  });
  return dataList.list || [{}];
}

// /api/v2/credit-liquidation/cycle/create --创建一个清算周期
export async function createCycle(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/cycle/create`,
    method: 'post',
    data,
  });
}

// /api/v2/credit-liquidation/list --搜索/列出机构的清算周期
export async function creditLiquidationList(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/cycle/list`,
    method: 'get',
    data,
  });
}

// /api/v2/credit-liquidation/submit 临时接口

export async function submitCredit(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/submit`,
    method: 'post',
    data,
  });
}

// /api/v2/credit-liquidation/cycle/latest--查询最近一次清算周期的信息
export async function queryLatestCycle(org_id) {
  const data = await promiseRequest({
    url: `/api/v2/credit-liquidation/cycle/latest`,
    method: 'get',
    data: { org_id },
  });

  return data || {};
}

// /api/v2/credit-liquidation/cycle/detail --列出某个清算周期的详细信息，包括该清算周期的基本信息和清算总单(本周期内和本机构进行交易的机构)信息
export async function getCycleDetail(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/cycle/detail`,
    method: 'get',
    data,
  });
}

//  /api/v2/credit-liquidation/cycle/org/detail --机构间清算明细-列出某个清算周期内本机构有交易往来的机构的清算明细
export async function queryCycleList(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/cycle/org/detail`,
    method: 'get',
    data,
  });
}

// /api/v2/credit-liquidation/confirm--批量确认清算
export async function confirmLotsCredit(data) {
  return promiseRequest({
    url: `/api/v2/credit-liquidation/confirm`,
    method: 'post',
    data,
  });
}
