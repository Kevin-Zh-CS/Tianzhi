import promiseRequest from '@/utils/promiseRequest';

// 查看风控联盟的统计信息
export async function info() {
  return promiseRequest({
    url: `/api/v2/risk/info`,
  });
}

// 任务配置中心-新建任务
export async function taskCreate(params) {
  return promiseRequest({
    url: '/api/v2/risk/task-create',
    method: 'POST',
    data: params,
  });
}

// 任务配置中心-任务队列
export async function taskQueue(page = 1, size = 5) {
  return promiseRequest({
    url: `/api/v2/risk/task-queue?&page=${page}&size=${size}`,
  });
}

// 查询结果详情
export async function resultDetail(task_id = '', job_id = '') {
  return promiseRequest({
    url: `/api/v2/risk/result-detail?&task_id=${task_id}&job_id=${job_id}`,
  });
}

// 结果详情的风险详情信息
export async function resultDetailInfo(page = 1, size = 10, task_id = '', job_id = '') {
  return promiseRequest({
    url: `/api/v2/risk/result-detail/info?&page=${page}&size=${size}&task_id=${task_id}&job_id=${job_id}`,
  });
}

// 任务详情
export async function taskDetail(task_id = '') {
  return promiseRequest({
    url: `/api/v2/risk/task-detail?&task_id=${task_id}`,
  });
}

// 任务详情的详细信息
export async function taskDetailInfo(page = 1, size = 10, task_id = '', is_asc = false) {
  return promiseRequest({
    url: `/api/v2/risk/task-detail/info?&page=${page}&size=${size}&task_id=${task_id}&is_asc=${is_asc}`,
  });
}

// 循环任务的开启、关闭
export async function taskStatus(task_id = '', is_open) {
  return promiseRequest({
    url: `/api/v2/risk/task-status?&task_id=${task_id}&is_open=${is_open}`,
  });
}
