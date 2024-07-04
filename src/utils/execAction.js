import pathToReg from 'path-to-regexp';
import router from 'umi/router';
import qs from 'qs';
import { message, Modal } from 'quanta-design';

import request from '@/utils/request';

const { confirm } = Modal;

// 默认错误请求处理
const defaultHandleError = res => {
  const msg = res ? res.message : '操作失败';
  message.error(msg);
};

/**
 * 每一项的 key 包含两部分，用空格隔开，分别表示请求方式和请求路径
 * 每一项的 value 的属性含义如下：
 * request: 是否去执行请求
 * link: 跳转链接，request 和 link 尽量保证不会同时出现，如果同时出现，优先按照 link 执行
 * href: 与 a 标签动作一致
 * confirm: 二次确认配置，类型为 Object
 * onSuccess: 请求执行成功后的回调, 类型可以为 string 或者 function
 * onError: 请求执行失败后的回调, 类型可以为 string 或者 function
 */

export const apiMap = {
  // 查看主机详情
  'GET /stdb/api/v1.0/instance/:id': {
    link: '/control/blockchain/server/detail',
  },
  // // 删除主机
  // 'GET /stdb/api/v1.0/instance/:serverId/driver/:driverId/actions/:actionId': {
  //   request: true,
  //   confirm: {
  //     title: '确定要删除该主机吗？',
  //   },
  //   onSuccess: '/control/blockchain/server',
  // },
  // 创建主机
  'GET /stdb/api/v1.0/form/instance/new': {
    link: '/control/blockchain/server/create',
  },
  // 查看链基本信息
  'GET /stdb/api/v1.0/chain/:chainId': {
    href: '/control/chain/baseinfo',
    target: '_blank',
  },
  // 查看节点管理
  'GET /stdb/api/v1.0/chain/:chainId/node': {
    href: '/control/chain/node',
    target: '_blank',
  },
  // 升级驱动
  'GET /stdb/api/v1.0/instance/:instanceId/driver/:driverId/action/upgrade': {
    request: true,
    onSuccess: () => {
      message.success('驱动升级成功');
    },
  },
  'GET /stdb/api/v1.0/form/driver/:driverId/edit': {
    link: '/control/manage/driver/edit',
  },
};

const getParams = (key, action) => {
  let params = {};
  const path = key.split(' ')[1];
  const { url } = action;
  const search = url.split('?');
  params = { ...qs.parse(search) };
  const names = [];
  const reg = pathToReg(path, names, { encode: encodeURIComponent, decode: decodeURIComponent });
  const result = url.match(reg);
  if (result) {
    names.forEach((item, index) => {
      params[item.name] = result[index + 1];
    });
  }
  delete params[0];
  return params;
};

const execDirect = (targetApi, params) => {
  if (typeof targetApi.direct === 'function') {
    targetApi.direct(params);
  }
};

const execLink = (targetApi, params) =>
  router.push({
    pathname: targetApi.link,
    query: { ...params },
  });

const execHref = (targetApi, params) => {
  const url = `${targetApi.href}${qs.stringify(params) ? `?${qs.stringify(params)}` : ''}`;
  if (targetApi.target) {
    window.open(url, targetApi.target);
  } else {
    window.location.href = url;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const execRequest = (targetApi, action, params) => {
  // 执行请求
  const options = { method: action.method };
  // if (action.method.toLowerCase() === 'post' || action.method.toLowerCase() === 'put') {
  //   options.data = params;
  // } else {
  //   options.params = params;
  // }

  return request(action.url, options)
    .then(res => {
      if (res && res.code === 200) {
        if (typeof targetApi.onSuccess === 'function') {
          targetApi.onSuccess(res);
        } else if (typeof targetApi.onSuccess === 'string') {
          router.push(targetApi.onSuccess);
        }
      } else if (typeof targetApi.onError === 'function') {
        targetApi.onError(res);
      } else {
        defaultHandleError(res);
      }
    })
    .catch(() => {
      defaultHandleError();
    });
};

const isRequest = action => {
  if (action) {
    let { method } = action;
    method = method.toLowerCase();
    return (
      method === 'get' ||
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      method === 'delete'
    );
  }
  return false;
};

const getTargetkey = (action, mergedApiMap) => {
  const apiKeys = Object.keys(mergedApiMap);
  const [targetKey] = apiKeys.filter(key => {
    const [method, path] = key.split(' ');
    return method.toLowerCase() === action.method.toLowerCase() && pathToReg(path).test(action.url);
  });
  return targetKey;
};

const getTargetApi = (action, mergedApiMap) => {
  const targetKey = getTargetkey(action, mergedApiMap);
  if (targetKey) {
    return mergedApiMap[targetKey];
  }
  return null;
};

const execRequestByDefault = (action, mergedApiMap) => {
  const { method, url, randerType } = action;
  // eslint-disable-next-line consistent-return
  return request(url, { method })
    .then(res => {
      if (res && res.code === 200) {
        if (randerType === 'TOAST' || typeof randerType === 'undefined') {
          message.success(res.message || '操作成功');
        } else if (randerType === 'CONFIRM') {
          const info = res.data[0] || {};
          const { title = {}, buttons } = info;
          if (title.text) {
            confirm({
              title: title.text,
              content: title.subNames ? title.subNames[0].text : null,
              onOk: buttons[1]
                ? () => execRequestByDefault(buttons[1].action, mergedApiMap)
                : Promise.resolve(),
              onCancel: () => {},
            });
          }
        }
        return Promise.resolve(res);
      }
      const emsg = res ? res.message : '操作失败';
      if (randerType === 'TOAST' || typeof randerType === 'undefined' || randerType === 'CONFIRM') {
        message.error(emsg);
      }
      return Promise.reject(emsg);
    })
    .then(res => {
      const targetApi = getTargetApi(action, mergedApiMap);
      if (targetApi && typeof targetApi.onSuccess === 'function') {
        targetApi.onSuccess(res);
      }
    })
    .catch(error => {
      const targetApi = getTargetApi(action, mergedApiMap);
      if (targetApi && typeof targetApi.onError === 'function') {
        targetApi.onError(error);
      }
    });
};

/**
 *
 * @param {*} action
 * method: 请求方式
 * url: 请求地址
 */
const execAction = (action = {}, otherApiMap = {}) => {
  const mergedApiMap = { ...apiMap, ...otherApiMap };
  if (action) {
    const targetKey = getTargetkey(action, mergedApiMap);
    if (targetKey) {
      const targetApi = mergedApiMap[targetKey];
      const params = getParams(targetKey, action);
      const doAction = () => {
        if (targetApi.direct) {
          return execDirect(targetApi, params);
        }
        if (targetApi.link) {
          return execLink(targetApi, params);
        }
        if (targetApi.href) {
          return execHref(targetApi, params);
        }
        return execRequestByDefault(action, mergedApiMap);
      };

      if (targetApi.confirm) {
        targetApi.confirm.onOk = () => doAction();
        confirm({ ...targetApi.confirm });
        return;
      }
      doAction();
    } else if (isRequest(action)) {
      // todo: 设置一个默认动作
      execRequestByDefault(action, mergedApiMap);
    }
  }
};

export default execAction;
