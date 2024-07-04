import {
  taskList,
  taskAdd,
  taskInfo,
  taskDetail,
  taskUpdate,
  taskDelete,
  taskDeploy,
  taskInvoke,
  partnerAdd,
  partnerList,
  partnerDelete,
  sponsorDataAdd,
  sponsorDataDetail,
  partnerDataAdd,
  partnerDataApply,
  partnerDataDetail,
  partnerDataList,
  partnerDataDelete,
  modelView,
  modelUpdate,
  // subModelView,
  subModelUpdate,
  subModelApply,
  subModelBatchApply,
  subModelInvoke,
  searchTaskMember,
  searchTaskOrg,
  searchOrgData,
} from '@/services/sponsor';

const sponsorModel = {
  namespace: 'sponsor',
  state: {
    taskList: [],
    taskTotal: 0,
    taskInfo: {},
    taskDetail: [],
    dataDetail: {},
    dataList: [],
    modelList: [],
  },
  effects: {
    *taskList({ payload, callback }, { call, put }) {
      const response = yield call(taskList, { ...payload });
      yield put({
        type: 'saveTaskList',
        payload: response || [],
      });
      if (callback) callback(response);
    },
    *taskAdd({ payload, callback }, { call }) {
      const response = yield call(taskAdd, { ...payload });
      if (callback) callback(response);
    },
    *taskInfo({ payload, callback }, { call, put }) {
      const response = yield call(taskInfo, payload);
      yield put({
        type: 'saveTaskInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *taskDetail({ payload, callback }, { call, put }) {
      const response = yield call(taskDetail, payload);
      yield put({
        type: 'saveTaskDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *taskUpdate({ payload, callback }, { call }) {
      const response = yield call(taskUpdate, { ...payload });
      if (callback) callback(response);
    },
    *taskDelete({ payload, callback }, { call }) {
      const response = yield call(taskDelete, { ...payload });
      if (callback) callback(response);
    },
    *partnerAdd({ payload, callback }, { call }) {
      const response = yield call(partnerAdd, { ...payload });
      if (callback) callback(response);
    },
    *taskDeploy({ payload, callback }, { call }) {
      const response = yield call(taskDeploy, { ...payload });
      if (callback) callback(response);
    },
    *taskInvoke({ payload, callback }, { call }) {
      const response = yield call(taskInvoke, { ...payload });
      if (callback) callback(response);
    },
    *partnerList({ payload, callback }, { call }) {
      const response = yield call(partnerList, { ...payload });
      if (callback) callback(response);
    },
    *partnerDelete({ payload, callback }, { call }) {
      const response = yield call(partnerDelete, { ...payload });
      if (callback) callback(response);
    },
    *sponsorDataAdd({ payload, callback }, { call }) {
      const response = yield call(sponsorDataAdd, { ...payload });
      if (callback) callback(response);
    },
    *sponsorDataDetail({ payload, callback }, { call, put }) {
      const response = yield call(sponsorDataDetail, { ...payload });
      yield put({
        type: 'saveDataDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *partnerDataAdd({ payload, callback }, { call }) {
      const response = yield call(partnerDataAdd, { ...payload });
      if (callback) callback(response);
    },
    *partnerDataApply({ payload, callback }, { call }) {
      const response = yield call(partnerDataApply, { ...payload });
      if (callback) callback(response);
    },
    *partnerDataDetail({ payload, callback }, { call, put }) {
      const response = yield call(partnerDataDetail, { ...payload });
      yield put({
        type: 'saveDataDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *partnerDataList({ payload, callback }, { call, put }) {
      const response = yield call(partnerDataList, payload);
      yield put({
        type: 'saveModelList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *partnerDataDelete({ payload, callback }, { call }) {
      const response = yield call(partnerDataDelete, { ...payload });
      if (callback) callback(response);
    },
    *modelView({ payload, callback }, { call }) {
      const response = yield call(modelView, { ...payload });
      if (callback) callback(response);
    },
    *modelUpdate({ payload, callback }, { call }) {
      const response = yield call(modelUpdate, { ...payload });
      if (callback) callback(response);
    },
    // *subModelView({ payload, callback }, { call }) {
    //   const response = yield call(subModelView, { ...payload });
    //   if (callback) callback(response);
    // },
    *subModelUpdate({ payload, callback }, { call }) {
      const response = yield call(subModelUpdate, { ...payload });
      if (callback) callback(response);
    },
    *subModelApply({ payload, callback }, { call }) {
      const response = yield call(subModelApply, { ...payload });
      if (callback) callback(response);
    },
    *subModelBatchApply({ payload, callback }, { call }) {
      const response = yield call(subModelBatchApply, { ...payload });
      if (callback) callback(response);
    },
    *subModelInvoke({ payload, callback }, { call }) {
      const response = yield call(subModelInvoke, { ...payload });
      if (callback) callback(response);
    },
    *searchTaskMember({ payload, callback }, { call }) {
      const response = yield call(searchTaskMember, { ...payload });
      if (callback) callback(response);
    },
    *searchTaskOrg({ payload, callback }, { call }) {
      const response = yield call(searchTaskOrg, { ...payload });
      if (callback) callback(response);
    },
    *searchOrgData({ payload, callback }, { call }) {
      const response = yield call(searchOrgData, { ...payload });
      if (callback) callback(response);
    },
  },
  reducers: {
    saveTaskList(state, { payload }) {
      return {
        ...state,
        taskList: payload.task_list || [],
        taskTotal: payload.total || 0,
      };
    },
    saveTaskInfo(state, { payload }) {
      return { ...state, taskInfo: payload || {} };
    },
    saveTaskDetail(state, { payload }) {
      return { ...state, taskDetail: payload || [] };
    },
    saveDataDetail(state, { payload }) {
      return { ...state, dataDetail: payload || {} };
    },
    saveModelList(state, { payload }) {
      return {
        ...state,
        dataList: payload || [],
        modelList: payload.filter(item => item.data_status >= 5) || [],
      };
    },
  },
};
export default sponsorModel;
