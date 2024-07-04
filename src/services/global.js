import promiseRequest from '@/utils/promiseRequest';

export async function getList() {
  return promiseRequest({
    url: '/api/v2/list',
  });
}

// 按条件分页查找数据
export async function getTopicEmuns() {
  const data = await promiseRequest({
    url: `/api/v2/datasharing/topics`,
    method: 'get',
  });
  return data.map(item => ({ key: item.topic_id, value: item.topic_name, type: 'theme' }));
}
