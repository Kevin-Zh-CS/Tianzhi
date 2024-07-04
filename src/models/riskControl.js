import {
  info,
  taskCreate,
  taskQueue,
  resultDetail,
  resultDetailInfo,
  taskDetail,
  taskDetailInfo,
  taskStatus,
} from '@/services/riskControl';

const riskControl = {
  namespace: 'riskControl',
  state: {
    info: {},
    taskQueue: [],
    resultDetail: {},
    resultDetailInfo: {},
    taskDetail: {},
    taskDetailInfo: {},
    queryTask: {},
    modalInfo: {
      loopVisible: false,
      tab: '',
      singleVisible: false,
      taskId: '',
      jobId: '',
    },
    resultVisible: false,
    animation: false,
    skipAnimation: false,
  },
  effects: {
    *info({ payload }, { call, put }) {
      const response = yield call(info, payload);
      yield put({
        type: 'saveInfo',
        payload: response,
      });
    },
    *taskCreate({ payload, callback }, { call }) {
      const response = yield call(taskCreate, payload);
      if (callback) callback(response);
    },
    *taskQueue({ payload, callback }, { call, put }) {
      const response = yield call(taskQueue, payload.page, payload.size);
      if (payload.isUpdate)
        yield put({
          type: 'saveTaskQueue',
          payload: response,
        });
      if (callback) callback(response);
    },
    *taskQueueLazyLoad({ payload, callback }, { call, put, select }) {
      const response = yield call(taskQueue, payload.page, payload.size);
      const _taskQueue = yield select(state => state.riskControl.taskQueue);
      if (_taskQueue.length < response.total) {
        let list = [];
        if (_taskQueue.length < payload.page * payload.size) {
          // 当页则替换
          list = _taskQueue.slice(0, (payload.page - 1) * payload.size).concat(response.list || []);
        } else {
          // 次页则拼接
          list = _taskQueue.concat(response.list || []);
        }
        yield put({
          type: 'saveTaskQueueLazyLoad',
          payload: list,
        });
        if (callback) callback(response);
      }
    },
    *resultDetail({ payload }, { call, put }) {
      const response = yield call(resultDetail, payload.task_id, payload.job_id);
      yield put({
        type: 'saveResultDetail',
        payload: response,
      });
    },
    *resultDetailInfo({ payload, callback }, { call, put }) {
      const response = yield call(
        resultDetailInfo,
        payload.page,
        payload.size,
        payload.task_id,
        payload.job_id,
      );
      if (response?.list) {
        if (response.list[0]?.task_type) {
          response.account_risk_list = [];
          response.business_risk_list = response.list.map(item => item.business_risk_list);
        } else {
          response.account_risk_list = response.list.map(item => item.account_risk_list);
          response.business_risk_list = [];
        }
      }
      yield put({
        type: 'saveResultDetailInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *taskDetail({ payload, callback }, { call, put }) {
      const response = yield call(taskDetail, payload.task_id);
      yield put({
        type: 'saveTaskDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *taskDetailInfo({ payload, callback }, { call, put }) {
      const response = yield call(
        taskDetailInfo,
        payload.page,
        payload.size,
        payload.task_id,
        payload.is_asc,
      );
      yield put({
        type: 'saveTaskDetailInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *taskStatus({ payload, callback }, { call }) {
      const response = yield call(taskStatus, payload.task_id, payload.is_open);
      if (callback) callback(response);
    },
  },
  reducers: {
    saveInfo(state, action) {
      return { ...state, info: action.payload || {} };
    },
    saveTaskQueue(state, action) {
      return { ...state, taskQueue: action.payload?.list || [] };
    },
    saveTaskQueueLazyLoad(state, action) {
      return { ...state, taskQueue: action.payload };
    },
    saveResultDetail(state, action) {
      return { ...state, resultDetail: action.payload || {} };
    },
    saveResultDetailInfo(state, action) {
      return { ...state, resultDetailInfo: action.payload || {} };
    },
    saveTaskDetail(state, action) {
      return { ...state, taskDetail: action.payload || {} };
    },
    saveTaskDetailInfo(state, action) {
      return { ...state, taskDetailInfo: action.payload || {} };
    },
    saveResultVisible(state, action) {
      return { ...state, resultVisible: action.payload };
    },
    saveSkipAnimation(state, action) {
      return { ...state, skipAnimation: action.payload };
    },
    saveAnimation(state, action) {
      return { ...state, animation: action.payload };
    },
    saveQueryTask(state, action) {
      return { ...state, queryTask: action.payload };
    },
    saveModalInfo(state, action) {
      return { ...state, modalInfo: Object.assign({}, state.modalInfo, action.payload) };
    },
    resetData(state) {
      return {
        ...state,
        resultDetail: {},
        resultDetailInfo: {},
        taskDetail: {},
        taskDetailInfo: {},
      };
    },
  },
};
export default riskControl;
