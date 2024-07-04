import request from '@/utils/request';
import { message } from 'quanta-design';
import { router } from 'umi';

// 只支持一层简单json格式的对象
const jsonToUrlEncode = data =>
  Object.entries(data)
    .map(res => (res[1] !== undefined ? `${res[0]}=${window.encodeURIComponent(res[1])}` : ''))
    .join('&');

const getTrueData = data => data !== null && data !== '' && data !== undefined;
const getParams = (method, params) => {
  switch (method) {
    case 'get':
      return jsonToUrlEncode(params);
    case 'delete':
      return jsonToUrlEncode(params);
    default:
      return params;
  }
};

export default async function promiseRequest(param) {
  const { url, data, method = 'get', dispatch, ...last } = param;
  const params = {};
  // eslint-disable-next-line
  for (let key in data) {
    if (getTrueData(data[key])) params[key] = data[key];
  }
  try {
    if (dispatch) {
      dispatch({
        type: 'global/loading',
        payload: true,
      });
    }
    const res = await request(
      (method === 'get' || method === 'delete') && data
        ? `${url}?${getParams(method, params)}`
        : url,
      { data, method, ...last },
    );

    if (res?.code === 0) {
      if (dispatch) {
        dispatch({
          type: 'global/loading',
          payload: false,
        });
      }
      return res.data;
    }
    // 10857
    if (res?.code === 10857) {
      router.replace('/login');
    }
    if (res?.code === 20009) {
      if (dispatch) {
        dispatch({
          type: 'global/loading',
          payload: false,
        });
      }
      return {};
    }
    throw new Error(res?.message || res?.msg || 'Error');
  } catch (e) {
    const err = e.response ? e.response.data : e;
    const msg = err?.message || err;

    message.error(msg);
    if (dispatch) {
      dispatch({
        type: 'global/loading',
        payload: false,
      });
    }
    return Promise.reject(msg);
  }
}
