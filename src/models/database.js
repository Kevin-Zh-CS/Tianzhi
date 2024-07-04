import {
  databaseList,
  createDatabase,
  deleteDatabase,
  databaseDetail,
  tableList,
  mongoTableList,
  columnList,
  tableDetailList,
  databaseRecords,
  mongoList,
  mongoListTotal,
} from '@/services/database';

export default {
  namespace: 'database',
  state: {
    databaseList: [],
    databaseDetail: {},
    tableList: [],
    columnList: [],
    tableDetailList: [],
    databaseRecords: {},
  },
  effects: {
    *databaseList({ payload, callback }, { call, put }) {
      const response = yield call(databaseList, { ...payload });
      yield put({
        type: 'saveDatabaseList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *databaseRecords({ payload, callback }, { call, put }) {
      const response = yield call(databaseRecords, { ...payload });
      yield put({
        type: 'saveDatabaseRecords',
        payload: response,
      });
      if (callback) callback(response);
    },
    *createDatabase({ payload, callback }, { call }) {
      const response = yield call(createDatabase, { ...payload });
      if (callback) callback(response);
    },
    *deleteDatabase({ payload, callback }, { call }) {
      const response = yield call(deleteDatabase, { ...payload });
      if (callback) callback(response);
    },
    *databaseDetail({ payload, callback }, { call, put }) {
      const response = yield call(databaseDetail, { ...payload });
      yield put({
        type: 'saveDatabaseDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *tableList({ payload, callback }, { call, put }) {
      const response = yield call(payload.dbType === 'mongo' ? mongoTableList : tableList, {
        ...payload,
      });
      yield put({
        type: 'saveTableList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *columnList({ payload, callback }, { call, put }) {
      const response = yield call(columnList, { ...payload });
      yield put({
        type: 'saveColumnList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *tableDetailList({ payload, callback }, { call, put }) {
      const response = yield call(tableDetailList, { ...payload });
      yield put({
        type: 'saveTableDetailList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *mongoList({ payload, callback }, { call, put }) {
      const response = yield call(mongoList, { ...payload });
      const _response = yield call(mongoListTotal, { ...payload });
      // eslint-disable-next-line no-shadow
      const columnList = [];
      response.forEach(item => {
        item.record.forEach(_item => {
          if (!columnList.find(listItem => listItem.name === _item.key))
            columnList.push({ name: _item.key });
        });
      });
      const detailList = response.map(item => {
        const listItem = {};
        item.record.forEach(_item => {
          listItem[_item.key] = _item.value;
        });
        return listItem;
      });
      yield put({
        type: 'saveColumnList',
        payload: columnList,
      });
      yield put({
        type: 'saveTableDetailList',
        payload: { records: detailList, total: _response, currentPage: payload.page },
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    saveDatabaseList(state, { payload }) {
      return { ...state, databaseList: payload || [] };
    },
    saveDatabaseRecords(state, { payload }) {
      return { ...state, databaseRecords: payload || {} };
    },
    saveDatabaseDetail(state, { payload }) {
      return { ...state, databaseDetail: payload || {} };
    },
    saveTableList(state, { payload }) {
      return { ...state, tableList: payload || [] };
    },
    saveColumnList(state, { payload }) {
      return { ...state, columnList: payload || [] };
    },
    saveTableDetailList(state, { payload }) {
      return { ...state, tableDetailList: payload || [] };
    },
  },
};
