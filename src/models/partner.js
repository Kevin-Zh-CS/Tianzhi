import {
  taskList,
  // dataInviteInfo,
  taskConfirm,
  dataInviteCreate,
  dataInviteConfirm,
  // dataShareDetail,
  subModelApprove,
  subModelInvoke,
  // taskQuit,
  // taskDelete,
  taskInfo,
  dataInfo,
  approvalRecord,
} from '@/services/partner';

const partnerModel = {
  namespace: 'partner',
  state: {
    taskInfo: {},
    taskList: [],
    taskCount: 0,
    dataInfo: {},
    // dataDetail: {},
    approvalRecord: [],
  },
  effects: {
    *taskList({ payload, callback }, { call, put }) {
      const response = yield call(taskList, { ...payload });
      yield put({
        type: 'saveTaskList',
        payload: response,
      });
      if (callback) callback(response);
    },
    // *dataInviteInfo({ payload, callback }, { call, put }) {
    //   const response = yield call(dataInviteInfo, { ...payload });
    //   yield put({
    //     type: 'saveDataDetail',
    //     payload: response,
    //   });
    //   if (callback) callback(response);
    // },
    *taskConfirm({ payload, callback }, { call }) {
      const response = yield call(taskConfirm, { ...payload });
      if (callback) callback(response);
    },
    *dataInviteCreate({ payload, callback }, { call }) {
      const response = yield call(dataInviteCreate, { ...payload });
      if (callback) callback(response);
    },
    *dataInviteConfirm({ payload, callback }, { call }) {
      const response = yield call(dataInviteConfirm, { ...payload });
      if (callback) callback(response);
    },
    // *dataShareDetail({ payload, callback }, { call, put }) {
    //   const response = yield call(dataShareDetail, { ...payload });
    //   yield put({
    //     type: 'saveDataDetail',
    //     payload: response,
    //   });
    //   if (callback) callback(response);
    // },
    *subModelApprove({ payload, callback }, { call }) {
      const response = yield call(subModelApprove, { ...payload });
      if (callback) callback(response);
    },
    *subModelInvoke({ payload, callback }, { call }) {
      const response = yield call(subModelInvoke, { ...payload });
      if (callback) callback(response);
    },
    *taskInfo({ payload, callback }, { call, put }) {
      const response = yield call(taskInfo, { ...payload });
      yield put({
        type: 'saveTaskInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *dataInfo({ payload, callback }, { call, put }) {
      const response = yield call(dataInfo, { ...payload });
      yield put({
        type: 'saveDataInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *approvalRecord({ payload, callback }, { call, put }) {
      const response = yield call(approvalRecord, { ...payload });
      yield put({
        type: 'saveApprovalRecord',
        payload: response,
      });
      if (callback) callback(response);
    },
  },
  reducers: {
    saveTaskList(state, { payload }) {
      return { ...state, taskList: payload.task_list || [], taskCount: payload.total };
    },
    saveDataInfo(state, { payload }) {
      return { ...state, dataInfo: payload || {} };
    },
    saveTaskInfo(state, { payload }) {
      return { ...state, taskInfo: payload || {} };
    },
    // saveDataDetail(state, { payload }) {
    //   return { ...state, dataDetail: payload.data || {} };
    // },
    saveApprovalRecord(state, { payload }) {
      return { ...state, approvalRecord: payload || {} };
    },
  },
};
export default partnerModel;
