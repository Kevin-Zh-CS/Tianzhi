import {
  login,
  info,
  updatePwd,
  updateName,
  userList,
  resetPwd,
  disable,
  enable,
  register,
  batchRegister,
  template,
  message,
  key,
} from '@/services/account';
import { setToken } from '@/utils/request';
import { getOpenModules, getRoleSettingList } from '@/services/organization';

export default {
  namespace: 'account',
  state: {
    info: {},
    userCount: 0,
    userList: [],
    fileList: [],
    failList: [],
    passList: [],
    authAll: [],
    menus: [],
  },
  effects: {
    *login({ payload, callback }, { call }) {
      const response = yield call(login, { ...payload });
      localStorage.setItem('token', response.token);
      localStorage.setItem('expire', response.expire);
      setToken();
      if (callback) callback(response);
    },
    *info({ payload, callback }, { call, put }) {
      const response = yield call(info, { ...payload });
      yield put({
        type: 'saveInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *updatePwd({ payload, callback }, { call }) {
      const response = yield call(updatePwd, { ...payload });
      if (callback) callback(response);
    },
    *updateName({ payload, callback }, { call }) {
      const response = yield call(updateName, { ...payload });
      if (callback) callback(response);
    },
    *userList({ payload, callback }, { call, put }) {
      const response = yield call(userList, { ...payload });
      yield put({
        type: 'saveUserList',
        payload: response,
      });
      if (callback) callback(response);
    },

    *getMenusList({ payload }, { call, put }) {
      const response = yield call(getOpenModules, payload);
      yield put({
        type: 'saveMenus',
        payload: response,
      });
    },
    *getAllAuthList({ payload }, { call, put }) {
      const response = yield call(getRoleSettingList, payload);
      yield put({
        type: 'saveAuth',
        payload: response,
      });
    },
    *register({ payload, callback }, { call }) {
      const response = yield call(register, { ...payload });
      if (callback) callback(response);
    },
    *resetPwd({ payload, callback }, { call }) {
      const response = yield call(resetPwd, { ...payload });
      if (callback) callback(response);
    },
    *disable({ payload, callback }, { call }) {
      const response = yield call(disable, { ...payload });
      if (callback) callback(response);
    },
    *enable({ payload, callback }, { call }) {
      const response = yield call(enable, { ...payload });
      if (callback) callback(response);
    },
    *batchRegister({ payload, callback }, { call, put }) {
      try {
        yield put({
          type: 'saveFileList',
          payload,
        });
        const response = yield call(batchRegister, { ...payload });
        yield put({
          type: 'saveFailList',
          payload: response,
        });
        if (callback) callback(response);
        return response;
      } catch (e) {
        return Promise.reject();
      }
    },
    *template({ callback }, { call }) {
      const response = yield call(template);
      if (response.data instanceof Blob) {
        if (callback && typeof callback === 'function') {
          callback(response.data);
        }
      } else {
        message.warning('Some error messages...', 5);
      }
    },
    *key({ callback }, { call }) {
      const response = yield call(key);
      if (response.data instanceof Blob) {
        if (callback && typeof callback === 'function') {
          callback(response.data);
        }
      } else {
        message.warning('Some error messages...', 5);
      }
    },
  },

  reducers: {
    saveInfo(state, { payload }) {
      return { ...state, info: payload || {} };
    },
    saveUserList(state, { payload }) {
      return {
        ...state,
        userList: payload.status_users || [],
        userCount: payload.total || 0,
      };
    },
    saveFileList(state, { payload }) {
      return { ...state, fileList: payload.fileList || [] };
    },
    saveAuth(state, { payload }) {
      return { ...state, authAll: payload || [] };
    },
    saveMenus(state, { payload }) {
      return { ...state, menus: payload.sort((a, b) => a.module_id - b.module_id) || [] };
    },
    saveFailList(state, { payload }) {
      const { fileList } = state;
      fileList.map((obj, index) => {
        obj.index = index;
        return obj;
      });
      const resList = payload.fail_users;
      const passList = [...fileList].filter((_, index) =>
        [...resList].every(y => y.line_num !== index),
      );
      const failList = resList.map(obj => {
        const index = obj.line_num;
        const tmp = { ...obj, ...fileList[index] };
        return tmp;
      });
      return { ...state, passList, failList };
    },
  },
};
