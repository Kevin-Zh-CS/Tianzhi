import promiseRequest from '@/utils/promiseRequest';

/* 我参与的任务
  type: Number 参与类型
  page: Number 页码 默认 1
  size: Number 每页大小 默认 10
*/
export async function taskList(params) {
  // return request(`/api/v2/fc/participant/tasks?participate_type=${type}&page=${page}&size=${size}`);
  return promiseRequest({
    url: '/api/v2/fc/participant/tasks',
    method: 'get',
    data: { ...params },
  });
}
// 这个接口字段合并到 dataInfo
// /* 被"邀请参与"的数据信息
//   dataId: String 数据Id
// */
// export async function dataInviteInfo({ dataId = '' }) {
//   return request(`/api/v2/fc/participant/task-invite/data-info?data_id=${dataId}`);
// }
/* 确认是否参与
  dataId: String 数据Id
  {
    is_agree: Boolean
    refuse_reason: String
  }
*/
export async function taskConfirm({ dataId = '', isAgree = true, refuseReason = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/task-invite/confirm?data_id=${dataId}`,
    method: 'POST',
    data: {
      is_agree: isAgree,
      refuse_reason: refuseReason,
    },
  });
}
/* 参与方添加本地数据并绑定字段
  dataId: String 数据Id
  params: {
    ns_id: String 资源库ID
    data_id: String 数据ID
    field_mapping_rule: // todo: 具体格式还不清楚 // 映射规则
  }
*/
export async function dataInviteCreate(data) {
  return promiseRequest({
    url: `/api/v2/fc/participant/selfdata/configure?data_id=${data.id}`,
    method: 'POST',
    data,
  });
}
/* 参与方确认数据配置
  dataId: String 数据Id
*/
export async function dataInviteConfirm({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/selfdata/confirm?data_id=${dataId}`,
    method: 'POST',
  });
}
// 接口字段合并到 dataInfo
// /* "共享参与"的数据信息
//   dataId: String 数据Id
// */
// export async function dataShareDetail({ dataId = '' }) {
//   return request(`/api/v2/fc/participant/task-share/data-info?data_id=${dataId}`);
// }
/* 审批子模型
  dataId: String 数据Id
  params: {
    is_agree: Boolean
    refuse_reason: String
  }
*/
export async function subModelApprove({ dataId = '', isAgree = true, refuseReason = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/task-share/approve?data_id=${dataId}`,
    method: 'POST',
    data: {
      is_agree: isAgree,
      refuse_reason: refuseReason,
    },
  });
}
/* 运行子模型
  data_id: String 数据ID
  params: {
    sub_model: String 模型内容(代码)
	  abi: {
      func_name: String 方法名称
      args: Array 参数列表
    }
  }
*/
export async function subParticipantModelInvoke({ dataId = '', funName = '', args = [] }) {
  // return request(`/api/v2/fc/participant/task-share/sub-model/run?data_id=${dataId}`, {
  //   method: 'POST',
  //   data: {
  //     func_name: funName,
  //     args,
  //   },
  // });
  return promiseRequest({
    url: `/api/v2/fc/participant/task-share/sub-model/run?data_id=${dataId}`,
    method: 'post',
    data: {
      func_name: funName,
      args,
    },
  });
}
/* 退出任务
  dataId: String 数据Id
*/
export async function taskQuit({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/task/quit?data_id=${dataId}`,
    method: 'POST',
  });
}
/* 删除任务
  dataId: String 数据Id
*/
export async function taskDelete({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/task/delete?data_id=${dataId}`,
    method: 'POST',
  });
}
/* 查询任务基本信息
  data_id: String 数据ID
*/
export async function taskInfo({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/task?data_id=${dataId}`,
  });
}
/* 查询数据信息
  data_id: String 数据ID
*/
export async function dataInfo({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/data?data_id=${dataId}`,
  });
}
/* 查询子模型审核记录
  data_id: String 数据ID
*/
export async function approvalRecord({ dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/participant/data/approval/record?data_id=${dataId}`,
  });
}
