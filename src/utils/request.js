/* eslint-disable consistent-return */
/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { message } from 'quanta-design';
import { router } from 'umi';

let needToken = false;

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */
const errorHandler = () => {};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

// 对于http状态码的处理，500、404等
request.interceptors.response.use(
  async response => {
    if (
      (response.status >= 200 && response.status < 300) ||
      response.url.indexOf('download') !== -1
    ) {
      return response;
    }
    let errortext = codeMessage[response.status] || response.statusText;
    const responseJson = await response.clone().json();
    if (responseJson && responseJson.message) {
      errortext = responseJson.message;
    }
    message.error(errortext);
    const error = new Error(errortext);
    error.name = response.status;
    error.response = response;
    throw error;
  },
  { global: false },
);

// 对于http状态码是200，但是返回response是错误的处理
request.interceptors.response.use(
  async response => {
    if (response.url.indexOf('template') !== -1) return response;
    if (response.url.indexOf('batch') !== -1) return response;
    if (response.url.indexOf('key/download') !== -1) return response;

    const responseJson = await response.clone().json();
    const { code, message: errorText } = responseJson;
    if (code === 900006) {
      message.error(errorText);
    }
    if (code === 10253) {
      localStorage.removeItem('token');
      localStorage.removeItem('expire');
      router.push('/login');
    }

    return response;
  },
  { global: false },
);

request.interceptors.request.use(
  async (url, options) => {
    if (
      options.method === 'post' ||
      options.method === 'put' ||
      options.method === 'delete' ||
      options.method === 'get' ||
      options.method === 'patch'
    ) {
      needToken = true;
      let headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `data-flow ${localStorage.getItem('token')}`,
      };
      if (options.headers) {
        headers = { ...headers, ...options.headers };
      }
      if (url.startsWith('/stdb/api/v1.0/user/key/create/uploaded')) {
        delete headers['Content-Type'];
        delete headers.Accept;
      }
      return {
        url,
        options: { ...options, headers },
      };
    }
  },
  { global: false },
);

// 后端传回文件流的情况
const requestDownload = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  responseType: 'blob',
  getResponse: true,
});

requestDownload.interceptors.request.use(
  async (url, options) => {
    if (
      options.method === 'post' ||
      options.method === 'put' ||
      options.method === 'delete' ||
      options.method === 'get' ||
      options.method === 'patch'
    ) {
      needToken = true;
      let headers = {
        Authorization: `data-flow ${localStorage.getItem('token')}`,
      };
      if (options.headers) {
        headers = { ...headers, ...options.headers };
      }
      return {
        url,
        options: { ...options, headers },
      };
    }
  },
  { global: false },
);

// refresh token
const setToken = () => {
  setInterval(() => {
    if (needToken) {
      request('/api/v2/account/refresh-token').then(response => {
        if (response?.code === 0) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('expire', response.data.expire);
          needToken = false;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('expire');
          router.push('/login');
        }
      });
    }
  }, 10 * 60 * 1000);
};

export default request;
export { requestDownload, setToken };
