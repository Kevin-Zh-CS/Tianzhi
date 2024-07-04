import promiseRequest from '@/utils/promiseRequest';
import request from '@/utils/request';

/* 我发起的任务
  page: Number 页码 默认 1
  size: Number 每页大小 默认 10
*/
export async function taskList({ page = 1, size = 10 }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/tasks?page=${page}&size=${size}`,
  });
}
/* 新建任务
  {
    name: String 任务名称
    desc: String 任务描述
    visibility: Number 公开类型（0内部公开、1部分可见）
    members: Array [Required:false] 当公开类型为“内部公开”，默认为全部成员; 当公开类型为“部分可见”，需要选择成员
  }
*/
export async function taskAdd({ name = '', desc = '', visibility = 0, members = [] }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/create`,
    method: 'post',
    data: {
      name,
      desc,
      visibility,
      members,
    },
  });
}
/* 查询任务基本信息
  task_id: String 任务ID
*/
export async function taskInfo(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/info?task_id=${taskId}`,
  });
}
/* 查询任详细信息
  task_id: String 任务ID
*/
export async function taskDetail(taskId = '') {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/detail?task_id=${taskId}`,
  });
}
/* 修改任务名称和描述
  {
    task_id: String 任务ID
    new_name: String 新的任务名称
    new_desc: String 新的任务描述
  }
*/
export async function taskUpdate({
  taskId = '',
  name = '',
  desc = '',
  visibility = 0,
  members = [],
}) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/update?task_id=${taskId}`,
    method: 'post',
    data: {
      name,
      desc,
      visibility,
      members,
    },
  });
}
/* 删除任务
  task_id: String 任务ID
*/
export async function taskDelete(task_id) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/delete`,
    method: 'post',
    data: { task_id },
  });
}
/* 部署任务
  params: {
    task_id: String 任务ID
  }
*/
export async function taskDeploy(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/deploy?task_id=${taskId}`,
    method: 'post',
  });
}
/* 调用任务(调用总模型)
  params: {
	  task_id: String 待调用任务ID
	  abi: {
      func_name: String 方法名称
      args: Array 参数列表
    }
  }
*/
export async function taskInvoke({ taskId = '', funName = '', args = [] }) {
  return request(`/api/v2/fc/initiator/task/execute?task_id=${taskId}`, {
    method: 'POST',
    data: {
      abi: {
        func_name: funName,
        args,
      },
    },
  });
}
/* 查询已添加的参与方列表
  task_id: String 任务ID
*/
export async function partnerList(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/partners?task_id=${taskId}`,
  });
}
export async function partnerAdd({ taskId = '', partners = [] }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/partners/add?task_id=${taskId}`,
    method: 'post',
    data: {
      partners,
    },
  });
}
/* 移除参与方
  task_id: String 任务ID
  org_id: String 机构ID
*/
export async function partnerDelete({ taskId = '', orgId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/partners/delete`,
    method: 'post',
    data: {
      task_id: taskId,
      org_id: orgId,
    },
  });
}
/* 发起方添加本地数据
  task_id: String 任务ID
  org_id: String 机构ID
  params: {
    ns_id: String 资源库ID
    data_id: String 数据ID
  }
*/
export async function sponsorDataAdd({
  taskId = '',
  orgId = '',
  nsId = '',
  dataName = '',
  dataId = '',
}) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/selfdata/add?task_id=${taskId}&org_id=${orgId}`,
    method: 'post',
    data: {
      ns_id: nsId,
      data_name: dataName,
      data_id: dataId,
    },
  });
}
/* 发起方已添加的本地数据或者已购数据详情
  task_id: String 任务ID
  dataId: String 数据ID
*/
export async function sponsorDataDetail({ taskId = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/data/detail?task_id=${taskId}&data_id=${dataId}`,
  });
}
/* 发起方添加已购买该参与方的数据
  task_id: String 任务ID
  org_id: String 机构ID
  appkey: String 获取数据标识
*/
export async function partnerDataAdd({ taskId = '', orgId = '', appkey = '', nsId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/achieve/add?task_id=${taskId}&org_id=${orgId}&appkey=${appkey}&ns_id=${nsId}`,
    method: 'post',
  });
}
/* 邀请参与方添加数据
  task_id: String 任务ID
  {
    data_name: String 数据名称
    format_desc: String 数据格式说明
    participant_id: String 对接人地址
    participant_org_id: String 对接机构ID
    require_format: 数据格式
    [
      {
        name: String 名称
        type: String 类型
        example: String 示例
        desc: String 描述
      },
      ...
    ]
  }
*/
export async function partnerDataApply({
  taskId = '',
  orgId = '',
  address = '',
  dataName = '',
  dataDesc = '',
  dataMeta = [],
}) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/invite/add?task_id=${taskId}`,
    method: 'POST',
    data: {
      data_name: dataName,
      desc: '',
      format_desc: dataDesc,
      participant_id: address,
      participant_org_id: orgId,
      require_format: dataMeta,
    },
  });
}
/* 邀请参与方数据信息
  task_id: String 任务ID
  dataId: String 机构ID
*/
export async function partnerDataDetail({ taskId = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/invite/data-info?task_id=${taskId}&data_id=${dataId}`,
  });
}
/* 查询任务的数据列表
  task_id: String 任务ID
*/
export async function partnerDataList(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/data/list?task_id=${taskId}`,
  });
}
/* 移除数据
  task_id: String 任务ID
  data_id: String 数据ID
*/
export async function partnerDataDelete({ taskId = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/data/delete`,
    method: 'post',
    data: {
      task_id: taskId,
      data_id: dataId,
    },
  });
}
/* 查看总模型
  task_id: String 任务ID
*/
export async function modelView(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/model/view?task_id=${taskId}`,
  });
}
/* 更新总模型
  task_id: String 任务ID
  {
    model: String 总模型内容(代码)
  }
*/
function btoa(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

export async function modelUpdate({ taskId = '', modelCode = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/model/update?task_id=${taskId}`,
    method: 'post',
    data: {
      model: btoa(modelCode),
    },
  });
}

export async function subModelUpdate({ taskId = '', dataId = '', modelCode = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/sub-model/update?task_id=${taskId}&data_id=${dataId}`,
    method: 'post',
    data: {
      model: btoa(modelCode),
    },
  });
}
/* 发起审批子模型
  task_id: String 任务ID
  data_id: String 数据ID
*/
export async function subModelApply({ taskId = '', dataId = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/sub-model/apply?task_id=${taskId}&data_id=${dataId}`,
    method: 'post',
  });
}
/* 批量审批子模型
  task_id: String 任务ID
  data_id: String 数据ID
*/
export async function subModelBatchApply(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/sub-model/batch-apply?task_id=${taskId}`,
    method: 'post',
  });
}
/* 运行子模型
  task_id: String 任务ID
  {
    data_id: String 数据ID
    sub_model: String 模型内容(代码)
	  abi: {
      func_name: String 方法名称
      args: Array 参数列表
    }
  }
*/
export async function subModelInvoke({
  taskId = '',
  dataId = '',
  modelCode = '',
  funName = '',
  args = [],
}) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/sub-model/run?task_id=${taskId}`,
    method: 'post',
    data: {
      data_id: dataId,
      sub_model: modelCode,
      abi: {
        func_name: funName,
        args,
      },
    },
  });
}
/* 模糊查询添加到任务的成员
  task_id: String 任务ID
*/
export async function searchTaskMember({ taskId = '', params = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/search/member?task_id=${taskId}&member=${params}`,
  });
}
/* 模糊查询添加到任务的参与方
  task_id: String 任务ID
*/
export async function searchTaskOrg({ taskId = '', params = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/search/org?task_id=${taskId}&org_name=${params}`,
  });
}

/* 模糊查询添加到任务的参与方
  task_id: String 任务ID
*/
export async function searchOrgData({ taskId = '', orgId = '', params = '' }) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/search/data?task_id=${taskId}&org_id=${orgId}&org_name=${params}`,
  });
}

/* 停止任务
  task_id: String 任务ID
*/
export async function taskTerminate(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/terminate?task_id=${taskId}`,
    method: 'post',
  });
}

// /api/v1/{namespace}/task/restful-docs/info
export async function getRestfulInfo(id) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/restful-docs/info`,
    method: 'get',
    data: { id },
  });
}

// /api/v1/{namespace}/task/invoke/{id} 【POST】
export async function invokeRestful(namespace, id, data) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/invoke/${id}`,
    method: 'post',
    data,
  });
}

// /api/v1/{namespace}/task/restful-docs/generate 【POST】
export async function generateRestful(data) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/restful-docs/generate`,
    method: 'post',
    data,
  });
}
// /api/v2/fc/initiator/restful-url/generate
export async function generateRestfulUrl(task_id) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/restful-url/generate`,
    method: 'post',
    data: { task_id },
  });
}

export async function deployTask(taskId) {
  return promiseRequest({
    url: `/api/v2/fc/initiator/task/deploy?task_id=${taskId}`,
    method: 'post',
  });
}
