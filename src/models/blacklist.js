import { message } from 'quanta-design';
import _ from 'lodash';
import {
  orgList,
  query,
  latestRecord,
  localRecord,
  otherRecord,
  localRecordCount,
  otherRecordCount,
  download,
  template,
  info,
  recentRecord,
} from '@/services/blacklist';

const blacklistModel = {
  namespace: 'blacklist',
  state: {
    orgList: [],
    queryResult: [],
    blackListAmount: 0,
    latestRecordList: [],
    recentRecordList: [],
    localRecordList: [],
    otherRecordList: [],
    localRecordCount: 0,
    otherRecordCount: 0,
    countInfo: [],
  },
  effects: {
    *orgList({ payload }, { call, put, select }) {
      const response = yield call(orgList, payload);
      const _info = yield select(state => state.organization.info);
      const _response = _.remove(response, item => item.org_id !== _info.org_id);
      _response.splice(1, 0, _info);
      if (_response.length < 4) _response.push({ name: '证券机构' });
      yield put({
        type: 'saveOrgList',
        payload: _response,
      });
    },
    *query({ payload }, { call, put }) {
      try {
        const response = yield call(query, payload);
        yield put({
          type: 'saveQueryResult',
          payload: response,
        });
        return response;
      } catch (e) {
        return Promise.reject();
      }
    },
    *latestRecord({ payload }, { call, put }) {
      const response = yield call(latestRecord, payload);
      yield put({
        type: 'saveLatestRecordList',
        payload: response,
      });
    },
    *recentRecord({ payload }, { call, put }) {
      const response = yield call(recentRecord, payload);
      yield put({
        type: 'saveRecentRecordList',
        payload: response,
      });
    },
    *localRecord({ payload }, { call, put }) {
      const response = yield call(
        localRecord,
        payload.sort,
        payload.page,
        payload.size,
        payload.caller,
        payload.type,
      );
      yield put({
        type: 'saveLocalRecordList',
        payload: response,
      });
    },
    *otherRecord({ payload }, { call, put }) {
      const response = yield call(
        otherRecord,
        payload.sort,
        payload.page,
        payload.size,
        payload.org,
        payload.type,
      );
      yield put({
        type: 'saveOtherRecordList',
        payload: response,
      });
    },
    *localRecordCount({ payload }, { call, put }) {
      const response = yield call(localRecordCount, payload.caller, payload.type);
      yield put({
        type: 'saveLocalRecordCount',
        payload: response,
      });
    },
    *otherRecordCount({ payload }, { call, put }) {
      const response = yield call(otherRecordCount, payload.org, payload.type);
      yield put({
        type: 'saveOtherRecordCount',
        payload: response,
      });
    },
    *download({ payload, callback }, { call }) {
      const response = yield call(download, payload);
      if (response.data instanceof Blob) {
        if (callback && typeof callback === 'function') {
          callback(response.data);
        }
      } else {
        message.warning('Some error messages...', 5);
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
    *info({ payload }, { call, put }) {
      const response = yield call(info, payload);
      yield put({
        type: 'saveCountInfo',
        payload: response,
      });
    },
  },
  reducers: {
    saveOrgList(state, action) {
      return { ...state, orgList: action.payload || [] };
    },
    saveQueryResult(state, action) {
      return {
        ...state,
        queryResult: action.payload?.result || [],
        blackListAmount: action.payload?.amount || 0,
      };
    },
    saveLatestRecordList(state, action) {
      return { ...state, latestRecordList: action.payload || {} };
    },
    saveRecentRecordList(state, action) {
      return { ...state, recentRecordList: action.payload || {} };
    },
    saveLocalRecordList(state, action) {
      return { ...state, localRecordList: action.payload || {} };
    },
    saveOtherRecordList(state, action) {
      return { ...state, otherRecordList: action.payload || {} };
    },
    saveLocalRecordCount(state, action) {
      return { ...state, localRecordCount: action.payload || 0 };
    },
    saveOtherRecordCount(state, action) {
      return { ...state, otherRecordCount: action.payload || 0 };
    },
    saveCountInfo(state, action) {
      return { ...state, countInfo: action.payload || {} };
    },
  },
};
export default blacklistModel;
