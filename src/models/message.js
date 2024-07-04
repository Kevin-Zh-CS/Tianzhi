import { getUnReadNum } from '@/services/message';

export default {
  namespace: 'message',
  state: {
    totalNum: null,
  },
  effects: {
    *noteMessage({ payload, callback }, { call, put }) {
      const response = yield call(getUnReadNum, { ...payload });
      yield put({
        type: 'saveTotal',
        payload: response,
      });
      if (callback) callback(response);
    },
    reducers: {
      saveTotal(state, { payload }) {
        return { ...state, totalNum: payload || 0 };
      },
    },
  },
};
