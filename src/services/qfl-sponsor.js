import promiseRequest from '@/utils/promiseRequest';
// import axios from 'axios';

export async function getSponsorPartners(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/partners`,
    method: 'get',
    data,
  });

  return res.list || [];
}

export async function addSponsorPartners(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/partners/add`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/org/list

export async function getOrgList(project_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/org/list`,
    method: 'get',
    data: { project_id },
  });

  return res.list || [];
}

// /api/v1/qfl/project/initiator/selfdata/add [POST] - 发起方添加本地数据

export async function addSelfData(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project//initiator/selfdata/add`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/invite/add [POST] - 发起方添加邀请数据

export async function inviteOtherData(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/invite/add`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/partner/achieve/add - 发起方添加已购买该参与方的数据
export async function addAchieveData(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/achieve/add`,
    method: 'post',
    data,
  });

  return res || {};
}

// /api/v1/qfl/project/jobs
export async function loadJobs(project_id, caller_type, fl_step) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/jobs`,
    method: 'get',
    data: { project_id, fl_step, caller_type },
  });

  return res.job_list || [];
}

// /api/v1/qfl/job/preprocess/param [GET]

export async function getAllParams(fl_type) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/preprocess/param`,
    method: 'get',
    data: { fl_type },
  });

  return res.param_list || [];
}

export async function getInviteDetail(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/invite-data/detail`,
    method: 'get',
    data,
  });

  return res || {};
}

//

export async function createPreprocess(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/preprocess/create`,
    method: 'post',
    data,
  });

  return res || {};
}

// 查询数据预处理任务元信息
// /api/v1/qfl/job/preprocess/info [GET]

export async function getPreprocessInfo(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/preprocess/info`,
    method: 'get',
    data,
  });

  return res || {};
}

// 数据预处理任务参数
// /api/v1/qfl/job/preprocess/output/param [GET]

export async function getPreprocessJobResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/preprocess/job-result`,
    method: 'get',
    data: { job_id },
  });

  return res || {};
}

// 数据预处理任务输出
// /api/v1/qfl/job/preprocess/output/data [GET]

export async function getPreprocessDataResult(params) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/preprocess/data-result`,
    method: 'get',
    data: { ...params },
  });

  return res || {};
}

// 1. 创建特征工程任务
// /api/v1/qfl/job/fe/create [POST]
export async function createFeatureEngineer(data) {
  await promiseRequest({
    url: `/api/v1/qfl/job/fe/create`,
    method: 'post',
    data,
  });
}
// 2. list出所有的特征工程方法以及可配置的参数
// /api/v1/qfl/job/fe/param [GET]
export async function getFeatureEngineerApproach(fl_type) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/fe/param`,
    method: 'get',
    data: { fl_type },
  });
  return res.param_list || [];
}

// 3. 查询特征工程任务元信息
// /api/v1/qfl/job/fe/info [GET]
export async function getFeatureEngineerInfo(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/fe/info`,
    method: 'get',
    data,
  });
  return res || {};
}

// 5. 获取特征工程任务的数据结果
// /api/v1/qfl/job/fe/data-result [GET]
export async function getFeatureEngineerResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/fe/data-result`,
    method: 'get',
    data: { job_id, page: 1, size: 100 },
  });

  return res || {};
}

// 4. 特征工程的任务结果
// /api/v1/qfl/job/fe/job-result

export async function getFeatureJobResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/fe/job-result`,
    method: 'get',
    data: { job_id },
  });

  return res || {};
}

// 1. 新建安全建模任务
// /api/v1/qfl/job/modeling/create [POST]
export async function createModel(data) {
  await promiseRequest({
    url: `/api/v1/qfl/job/modeling/create`,
    method: 'post',
    data,
  });
}

//  list出所有的建模方法以及可配置的参数
// /api/v1/qfl/job/modeling/param [GET]
export async function getModelApproach(fl_type) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/param`,
    method: 'get',
    data: { fl_type },
  });
  return res || {};
}

//  3. 查询建模任务元信息
// /api/v1/qfl/project/modeling/job/info [GET]
export async function getModelInfo(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/info`,
    method: 'get',
    data,
  });
  return res || {};
}

//  5. 建模任务输出
// /api/v1/qfl/project/modeling/job/result [GET] - 预处理任务输出
export async function getModelJobResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/job-result`,
    method: 'get',
    data: { job_id },
  });
  return res || {};
}

// 6. 获取安全建模任务的数据结果
// /api/v1/qfl/job/modeling/data-result [GET]
export async function getModelDataResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/data-result`,
    method: 'get',
    data: { job_id, page: 1, size: 100 },
  });
  return res || {};
}

// 4. 安全建模任务指标结果
// /api/v1/qfl/job/modeling/evaluation-result [GET]

export async function getModelEvaluationResult(job_id) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/modeling/evaluation-result`,
    method: 'get',
    data: { job_id, page: 1, size: 100 },
  });
  return res || {};
}

// 删除未添加数据的参与方
// /api/v1/qfl/project/partners/delete [POST]

export async function deletePartners(data) {
  return promiseRequest({
    url: `/api/v1/qfl/project/partners/delete`,
    method: 'post',
    data,
  });
}

// 删除发起方未使用的数据
// /api/v1/qfl/project/self-data/delete  [POST]
export async function deleteSelfData(data) {
  return promiseRequest({
    url: `/api/v1/qfl/project/self-data/delete`,
    method: 'post',
    data,
  });
}

// 删除参与方未使用的数据
// /api/v1/qfl/project/participate-data/delete  [POST]
export async function deleteParticipateData(data) {
  return promiseRequest({
    url: `/api/v1/qfl/project/participate-data/delete`,
    method: 'post',
    data,
  });
}

// 1. 停止任务
// /api/v1/qfl/job/common/cancel [POST]
export async function cancelJob(data) {
  return promiseRequest({
    url: `/api/v1/qfl/job/common/cancel`,
    method: 'post',
    data,
  });
}

// 2. 删除任务
// /api/v1/qfl/job/common/delete [POST]
export async function deleteJob(data) {
  return promiseRequest({
    url: `/api/v1/qfl/job/common/delete`,
    method: 'post',
    data,
  });
}

// 5. 重启特征工程任务
// /api/v1/qfl/job/fe/restart [POST]

export async function restartStepThreeJob(data) {
  return promiseRequest({
    url: `/api/v1/qfl/job/fe/restart`,
    method: 'post',
    data,
  });
}

// 5. 重启安全建模任务
// /api/v1/qfl/job/modeling/restart [POST]
export async function restartStepFourJob(data) {
  return promiseRequest({
    url: `/api/v1/qfl/job/modeling/restart`,
    method: 'post',
    data,
  });
}

// 5. 重启数据预处理任务
// /api/v1/qfl/job/preprocess/restart [POST]
export async function restartStepTwoJob(data) {
  return promiseRequest({
    url: `/api/v1/qfl/job/preprocess/restart`,
    method: 'post',
    data,
  });
}

// 任务日志
// /api/v1/qfl/logs/cat
export async function getQflLogs(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/logs/cat`,
    method: 'post',
    data,
  });

  const dataList = (res.list || []).map(item => item.content);
  return dataList;
}

// /api/v1/qfl/logs/size
export async function getQflLogSize(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/logs/size`,
    method: 'post',
    data,
  });

  return res.list || [];
}

// /api/v1/qfl/data/batch-list-feature [POST]  根据数据id列表批量查询每个数据支持的特征列表
export async function getListFeature(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/common/batch-list-feature`,
    method: 'post',
    data,
  });

  return res.data_feature_map || {};
}

export async function getFeListFeature(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/fe/list-feature`,
    method: 'post',
    data,
  });

  return res.data_feature_map || {};
}
// /api/v2/importer/{namespace}/data/list
export async function getImporterData({ namespace = '', size = 1000 }) {
  return promiseRequest({
    url: `/api/v2/importer/${namespace}/data/list?page=${1}&size=${size}&is_time_desc=${true}&type=1`,
    method: 'get',
  });
}

// /api/v1/qfl/project/search/data

export async function getSearchData(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/project/search/data`,
    method: 'get',
    data,
  });

  return res || [];
}

// /api/v1/qfl/job/list
export async function getJobList(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/list`,
    method: 'get',
    data,
  });

  return res || [];
}

// /api/v1/qfl/job/place-top
export async function handlePlaceTop(data) {
  const res = await promiseRequest({
    url: `/api/v1/qfl/job/place-top`,
    method: 'post',
    data,
  });

  return res || [];
}

export async function modifyQflMember(data) {
  return promiseRequest({
    url: `/api/v2/resource/modify-member`,
    method: 'post',
    data,
  });
}

// /api/v1/qfl/project/self-data/analysis
export async function getQflAnalysis(data) {
  return promiseRequest({
    url: `/api/v1/qfl/project/self-data/analysis`,
    method: 'post',
    data,
  });
}

// /api/v1/qfl/node/resources
export async function getNodeResources() {
  return promiseRequest({
    url: `/api/v1/qfl/node/resources`,
  });
}
