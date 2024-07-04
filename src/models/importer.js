import React from 'react';
import {
  importDatabase,
  deleteData,
  dataInfo,
  updateInfo,
  dataList,
  addData,
  deleteRow,
  dataRowList,
  updateDataRow,
  template,
  message,
  argsList,
  contentList,
  modifyColumn,
  missingContent,
  deleteMissing,
  confirmData,
  relatedTaskInfo,
} from '@/services/importer';

export default {
  namespace: 'importer',
  state: {
    dataInfo: {},
    dataList: [],
    dataRowList: {},
    deleteData: {},
    argsList: [],
    contentList: {},
    missingContent: {},
    localFile: {},
    relatedTaskInfo: [],
  },
  effects: {
    *importDatabase({ payload, callback }, { call }) {
      const response = yield call(importDatabase, { ...payload });
      if (callback) callback(response);
    },
    *deleteData({ payload, callback }, { call, put }) {
      const response = yield call(deleteData, { ...payload });
      yield put({
        type: 'saveDeleteData',
        payload: response,
      });
      if (callback) callback(response);
    },
    *dataInfo({ payload, callback }, { call, put }) {
      const response = yield call(dataInfo, { ...payload });
      const res = yield call(dataRowList, { dataId: payload.id, ...payload });
      response.data.list = res?.records;
      response.data.total = res?.total;
      if (response.data?.list?.length) {
        const tmp = Object.keys(response.data.list[0]);
        response.data.columns = tmp.map(obj => {
          const item = {
            title: obj,
            dataIndex: obj,
            key: obj,
            render: text => <div style={{ minWidth: 40 }}>{text}</div>,
          };
          return item;
        });
      }
      yield put({
        type: 'saveDataInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *updateInfo({ payload, callback }, { call }) {
      const response = yield call(updateInfo, { ...payload });
      if (callback) callback(response);
    },
    *dataList({ payload, callback }, { call, put }) {
      const response = yield call(dataList, { ...payload });
      yield put({
        type: 'saveDataList',
        payload: response,
      });
      if (callback) callback(response);
      return response;
    },
    *addData({ payload, callback }, { call }) {
      const response = yield call(addData, { ...payload });
      if (callback) callback(response);
    },
    *deleteRow({ payload, callback }, { call }) {
      const response = yield call(deleteRow, { ...payload });
      if (callback) callback(response);
    },
    *dataRowList({ payload, callback }, { call, put }) {
      const response = yield call(dataRowList, { ...payload });
      yield put({
        type: 'saveDataRowList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *updateDataRow({ payload, callback }, { call }) {
      const response = yield call(updateDataRow, { ...payload });
      if (callback) callback(response);
    },
    *argsList({ payload, callback }, { call, put }) {
      const response = yield call(argsList, { ...payload });
      yield put({
        type: 'saveArgsList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *contentList({ payload, callback }, { call, put }) {
      const response = yield call(contentList, { ...payload });
      yield put({
        type: 'saveContentList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *modifyColumn({ payload, callback }, { call }) {
      const response = yield call(modifyColumn, { ...payload });
      if (callback) callback(response);
    },
    *missingContent({ payload, callback }, { call, put }) {
      const response = yield call(missingContent, { ...payload });
      yield put({
        type: 'saveMissingContent',
        payload: response,
      });
      if (callback) callback(response);
    },
    *deleteMissing({ payload, callback }, { call }) {
      const response = yield call(deleteMissing, { ...payload });
      if (callback) callback(response);
    },
    *confirmData({ payload, callback }, { call, put }) {
      const response = yield call(confirmData, { ...payload });
      yield put({
        type: 'savelocalFile',
        payload: {},
      });
      if (callback) callback(response);
    },
    *relatedTaskInfo({ payload, callback }, { call, put }) {
      const response = yield call(relatedTaskInfo, { ...payload });
      yield put({
        type: 'saveRelatedTaskInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *template({ callback }, { call }) {
      const response = yield call(template);
      console.log('response: ', response);
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
    saveDataInfo(state, { payload }) {
      return { ...state, dataInfo: payload.data || {} };
    },
    saveDataList(state, { payload }) {
      return { ...state, dataList: payload || {} };
    },
    saveDataRowList(state, { payload }) {
      return { ...state, dataRowList: payload || {} };
    },
    saveDeleteData(state, { payload }) {
      return { ...state, deleteData: payload || {} };
    },
    saveArgsList(state, { payload }) {
      return { ...state, argsList: payload || [] };
    },
    saveContentList(state, { payload }) {
      return { ...state, contentList: payload || {} };
    },
    saveMissingContent(state, { payload }) {
      return { ...state, missingContent: payload || {} };
    },
    savelocalFile(state, { payload }) {
      return { ...state, localFile: payload || {} };
    },
    saveRelatedTaskInfo(state, { payload }) {
      return { ...state, relatedTaskInfo: payload || [] };
    },
  },
};
