import { getList, getTopicEmuns } from '@/services/global';
import promiseRequest from '@/utils/promiseRequest';

export default {
  namespace: 'global',

  state: {
    list: [],
    topicEmuns: [],
    loading: false,
    loadingAuth: false,
  },

  effects: {
    *checkHasData({ payload }, { call, put }) {
      const res = yield call(getList, payload);
      yield put({ type: 'saveList', payload: res });
      return promiseRequest(res);
    },
    *setTopicEmuns({ payload }, { call, put }) {
      const res = yield call(getTopicEmuns, payload);
      yield put({ type: 'saveTopic', payload: res });
    },
    *loading({ payload }, { put }) {
      yield put({ type: 'saveLoading', payload });
    },
    *loadingAuth({ payload }, { put }) {
      yield put({ type: 'saveLoadingAuth', payload });
    },
  },

  reducers: {
    saveList(state, { payload }) {
      return {
        ...state,
        list: payload.list || [],
      };
    },
    saveTopic(state, { payload }) {
      return {
        ...state,
        topicEmuns: payload || [],
      };
    },
    saveLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    saveLoadingAuth(state, { payload }) {
      return {
        ...state,
        loadingAuth: payload,
      };
    },
  },

  // subscriptions: {
  //   setup({ history }) {
  //     // Subscribe history(url) change, trigger `load` action if pathname is `/`
  //   },
  // },
};
