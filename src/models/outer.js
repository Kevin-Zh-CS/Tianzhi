import { outerResourceList } from '@/services/outer';

export default {
  namespace: 'outer',
  state: {
    outerList: [],
  },
  effects: {
    *outerList({ payload, callback }, { call, put }) {
      const response = yield call(outerResourceList, { ...payload });
      yield put({
        type: 'saveResourceList',
        payload: response,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    saveResourceList(state, { payload }) {
      return { ...state, outerList: payload || [] };
    },
  },
};
