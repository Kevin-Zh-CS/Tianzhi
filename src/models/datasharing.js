import {
  searchData,
  dataDetail,
  generateOrder,
  confirmOrder,
  cancelOrder,
  orderDetail,
  authOrderByApplicant,
  creditOrderByApplicant,
  authOrderBySupplier,
  creditOrderBySupplier,
  dataStatistic,
  orgList,
  approvalOrder,
  offline,
  txRecordList,
  obtainPublishOrder,
  providePublishOrder,
} from '@/services/datasharing';

const datasharingModel = {
  namespace: 'datasharing',
  state: {
    dataBrief: {},
    dataDetail: {},
    generateOrder: {},
    confirmOrder: {},
    cancelOrder: {},
    orderDetail: {},
    authOrderByApplicant: {},
    creditOrderByApplicant: {},
    authOrderBySupplier: {},
    creditOrderBySupplier: {},
    dataStatistic: {},
    orgList: {},
    approvalOrder: {},
    txRecordList: {},
    close: false,
    obtainPublishList: {},
    providePublishList: {},
  },
  effects: {
    *searchData({ payload, callback }, { call, put }) {
      const response = yield call(searchData, { ...payload });
      yield put({
        type: 'saveDataBrief',
        payload: response,
      });
      if (callback) callback(response);
    },
    *dataDetail({ payload, callback }, { call, put }) {
      const response = yield call(dataDetail, { ...payload });
      yield put({
        type: 'saveDataDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *generateOrder({ payload, callback }, { call, put }) {
      const response = yield call(generateOrder, { ...payload });
      yield put({
        type: 'saveGeneratedOrder',
        payload: response,
      });
      if (callback) callback(response);
    },
    *confirmOrder({ payload, callback }, { call, put }) {
      const response = yield call(confirmOrder, { ...payload });
      yield put({
        type: 'saveConfirmedOrder',
        payload: response,
      });
      if (callback) callback(response);
    },
    *cancelOrder({ payload, callback }, { call, put }) {
      const response = yield call(cancelOrder, { ...payload });
      yield put({
        type: 'saveCancelledOrder',
        payload: response,
      });
      if (callback) callback(response);
    },
    *orderDetail({ payload, callback }, { call, put }) {
      const response = yield call(orderDetail, { ...payload });
      yield put({
        type: 'saveOrderDetail',
        payload: response,
      });
      if (callback) callback(response);
    },
    *authOrderByApplicant({ payload, callback }, { call, put }) {
      const response = yield call(authOrderByApplicant, { ...payload });
      yield put({
        type: 'saveAuthOrderByApplicant',
        payload: response,
      });
      if (callback) callback(response);
    },
    *creditOrderByApplicant({ payload, callback }, { call, put }) {
      const response = yield call(creditOrderByApplicant, { ...payload });
      yield put({
        type: 'saveCreditOrderByApplicant',
        payload: response,
      });
      if (callback) callback(response);
    },
    *authOrderBySupplier({ payload, callback }, { call, put }) {
      const response = yield call(authOrderBySupplier, { ...payload });
      yield put({
        type: 'saveAuthOrderBySupplier',
        payload: response,
      });
      if (callback) callback(response);
    },
    *creditOrderBySupplier({ payload, callback }, { call, put }) {
      const response = yield call(creditOrderBySupplier, { ...payload });
      yield put({
        type: 'saveCreditOrderBySupplier',
        payload: response,
      });
      if (callback) callback(response);
    },
    *dataStatistic({ payload, callback }, { call, put }) {
      const response = yield call(dataStatistic, { ...payload });
      yield put({
        type: 'saveDataStatistic',
        payload: response,
      });
      if (callback) callback(response);
    },
    *orgList({ payload, callback }, { call, put }) {
      const response = yield call(orgList, { ...payload });
      yield put({
        type: 'saveOrgList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *approvalOrder({ payload, callback }, { call, put }) {
      const response = yield call(approvalOrder, { ...payload });
      yield put({
        type: 'saveApprovalOrder',
        payload: response,
      });
      if (callback) callback(response);
    },
    *offline({ payload, callback }, { call }) {
      const response = yield call(offline, { ...payload });
      if (callback) callback(response);
    },
    *txRecordList({ payload, callback }, { call, put }) {
      const response = yield call(txRecordList, { ...payload });
      yield put({
        type: 'saveTxRecordList',
        payload: response,
      });
      if (callback) callback(response);
    },

    *closeBanner({ payload }, { put }) {
      yield put({
        type: 'handleClose',
        payload,
      });
    },
    *handleObainPublishData({ payload, callback }, { call, put }) {
      const response = yield call(obtainPublishOrder, { ...payload });
      yield put({
        type: 'saveObtainPublishData',
        payload: response,
      });
      if (callback) callback(response);
    },
    *handleProvidePublishData({ payload, callback }, { call, put }) {
      const response = yield call(providePublishOrder, { ...payload });
      yield put({
        type: 'saveProvidePublishData',
        payload: response,
      });
      if (callback) callback(response);
    },
  },
  reducers: {
    saveDataBrief(state, { payload }) {
      return { ...state, dataBrief: payload || {} };
    },
    saveDataDetail(state, { payload }) {
      return { ...state, dataDetail: payload || {} };
    },
    saveGeneratedOrder(state, { payload }) {
      return { ...state, generateOrder: payload || {} };
    },
    saveConfirmedOrder(state, { payload }) {
      return { ...state, confirmOrder: payload || {} };
    },
    saveCancelledOrder(state, { payload }) {
      return { ...state, cancelOrder: payload || {} };
    },
    saveOrderDetail(state, { payload }) {
      return { ...state, orderDetail: payload || {} };
    },
    saveAuthOrderByApplicant(state, { payload }) {
      return { ...state, authOrderByApplicant: payload || {} };
    },
    saveCreditOrderByApplicant(state, { payload }) {
      return { ...state, creditOrderByApplicant: payload || {} };
    },
    saveAuthOrderBySupplier(state, { payload }) {
      return { ...state, authOrderBySupplier: payload || {} };
    },
    saveCreditOrderBySupplier(state, { payload }) {
      return { ...state, creditOrderBySupplier: payload || {} };
    },
    saveDataStatistic(state, { payload }) {
      return { ...state, dataStatistic: payload || {} };
    },
    saveOrgList(state, { payload }) {
      return { ...state, orgList: payload || {} };
    },
    saveApprovalOrder(state, { payload }) {
      return { ...state, approvalOrder: payload || {} };
    },
    saveTxRecordList(state, { payload }) {
      return { ...state, txRecordList: payload || {} };
    },
    handleClose(state, { payload }) {
      return { ...state, close: payload };
    },
    saveObtainPublishData(state, { payload }) {
      return { ...state, obtainPublishList: payload || {} };
    },
    saveProvidePublishData(state, { payload }) {
      return { ...state, providePublishList: payload || {} };
    },
  },
};
export default datasharingModel;
