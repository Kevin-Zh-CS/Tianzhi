import promiseRequest from '@/utils/promiseRequest';

// /api/v2/{namespace}/file/rm
export async function rmInterface(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/rm`,
    method: 'post',
    data,
  });
}

// 获取列表数据
export async function getInterfaceList(namespace, data) {
  const dataList = await promiseRequest({
    url: `/api/v2/${namespace}/restful/list`,
    method: 'get',
    data,
  });
  const dataLists = (dataList.list || []).map(item => ({ ...item, key: item.id }));
  return { list: dataLists, total: dataList.total || 0 };
}

// publish 发布接口
export async function handleInterfacePublish(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/publish`,
    method: 'post',
    data,
  });
}

// 获取详情
export async function interfaceInfo(namespace, id, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/info?id=${id}`,
    method: 'get',
    dispatch,
  });
}

// 测试接口是否可以被调通
export async function interfaceTest(namespace, url) {
  // return promiseRequest({
  //   url: `/api/v2/${namespace}/restful/test-connection?url=${url}`,
  //   method: 'get',
  // });
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/test-connection?url=${url}`,
  });
}

// 发布接口的"下一步"
export async function handleInterfaceDeploy(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/deploy`,
    method: 'post',
    data,
    dispatch,
  });
}

//  删除接口
// /api/v2/{namespace}/restful/destroy
export async function interfaceDestroy(namespace, id) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/destroy?namespace=${namespace}`,
    method: 'post',
    data: {
      id,
    },
  });
}

// 有id的时候更新：update1
// /api/v2/{namespace}/restful/update
export async function updateInterface(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/update?id=${data.id}`,
    method: 'post',
    data,
    dispatch,
  });
}

// 没有id的时候&&授权发布的更新：update2
// /api/v2/{namespace}/restful/auth-publish
export async function updateAuthInterface(namespace, data, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/publish`,
    method: 'post',
    data,
    dispatch,
  });
}

// 没有id的时候&&积分发布的更新：update3
// /api/v2/{namespace}/restful/credit-publish
export async function updateCreditInterface(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/credit-publish`,
    method: 'post',
    data,
  });
}

// /api/v2/{namespace}/restful/invoke
export async function getInvoke(namespace, data) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/invoke`,
    method: 'post',
    data,
  });
}

// 批量删除
// /api/v2/{namespace}/restful/batch-destroy
export async function interfaceBatchDestroy(namespace, id) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/batch-destroy?namespace=${namespace}`,
    method: 'post',
    data: {
      id,
    },
  });
}

// 生成请求示例
// /api/v2/{namespace}/restful/example/generate
export async function interfaceGenerate(namespace, id, dispatch) {
  return promiseRequest({
    url: `/api/v2/${namespace}/restful/example/generate?id=${id}`,
    method: 'get',
    dispatch,
  });
}
