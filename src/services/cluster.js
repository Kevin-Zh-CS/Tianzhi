import promiseRequest from '@/utils/promiseRequest';

export async function getPeers(dispatch) {
  return promiseRequest({
    url: '/api/v2/cluster/peers',
    method: 'get',
    dispatch,
  });
}
