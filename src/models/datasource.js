import {
  createDatasource,
  datasourceDetail,
  datasourceList,
  deleteDatasource,
  publishDatasource,
  renameDatasource,
  updateDatasource,
} from '@/services/datasource';

export default {
  namespace: 'datasource',
  state: {
    datasourceDetail: {},
    datasourceList: [],
    pubResult: {},
  },
  effects: {
    *createDatasource({ payload }, { call }) {
      try {
        return yield call(createDatasource, { ...payload });
      } catch (e) {
        return Promise.reject();
      }
    },
    *deleteDatasource({ payload }, { call }) {
      try {
        return yield call(deleteDatasource, { ...payload });
      } catch (e) {
        return Promise.reject();
      }
    },
    *datasourceDetail({ payload }, { call, put }) {
      try {
        const response = yield call(datasourceDetail, { ...payload });
        yield put({
          type: 'saveDatasourceDetail',
          payload: response,
        });
        return response;
      } catch (e) {
        return Promise.reject();
      }
    },
    *datasourceList({ payload, callback }, { call, put }) {
      const response = yield call(datasourceList, { ...payload });
      yield put({
        type: 'saveDatasourceList',
        payload: response,
      });
      if (callback) callback(response);
      return response;
    },
    *publishDatasource({ payload }, { call, put }) {
      try {
        const response = yield call(publishDatasource, { ...payload });
        yield put({
          type: 'savePubResult',
          payload: response,
        });
        return response;
      } catch (e) {
        return Promise.reject();
      }
    },
    *renameDatasource({ payload, callback }, { call }) {
      const response = yield call(renameDatasource, { ...payload });
      if (callback) callback(response);
    },
    *updateDatasource({ payload, callback }, { call }) {
      const response = yield call(updateDatasource, { ...payload });
      if (callback) callback(response);
    },
  },

  reducers: {
    saveDatasourceDetail(state, { payload }) {
      return { ...state, datasourceDetail: payload || {} };
    },
    saveDatasourceList(state, { payload }) {
      return { ...state, datasourceList: payload || [] };
    },
    savePubResult(state, { payload }) {
      return { ...state, pubResult: payload || [] };
    },
  },
};
