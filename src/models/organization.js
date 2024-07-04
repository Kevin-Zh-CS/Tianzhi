import {
  info,
  groupList,
  memberList,
  groupAdd,
  search,
  groupMemberAdd,
  nameUpdate,
  roleUpdate,
  groupDelete,
  groupMemberDelete,
  root,
} from '@/services/organization';

export default {
  namespace: 'organization',

  state: {
    info: {},
    root: {},
    groupList: [],
    memberList: [],
    memberTotal: 0,
    tree: [],
  },

  effects: {
    *info({ payload, callback }, { call, put }) {
      const response = yield call(info, { ...payload });
      yield put({
        type: 'saveInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *groupAdd({ payload }, { call }) {
      try {
        return yield call(groupAdd, { ...payload });
      } catch (e) {
        return Promise.reject();
      }
    },
    *search({ payload, callback }, { call }) {
      const response = yield call(search, { ...payload });
      if (callback) callback(response);
    },
    *groupMemberAdd({ payload, callback }, { call }) {
      const response = yield call(groupMemberAdd, { ...payload });
      if (callback) callback(response);
    },
    *nameUpdate({ payload }, { call }) {
      try {
        return yield call(nameUpdate, { ...payload });
      } catch (e) {
        return Promise.reject();
      }
    },
    *roleUpdate({ payload, callback }, { call }) {
      const response = yield call(roleUpdate, { ...payload });
      if (callback) callback(response);
    },
    *groupDelete({ payload, callback }, { call }) {
      const response = yield call(groupDelete, { ...payload });
      if (callback) callback(response);
    },
    *groupMemberDelete({ payload, callback }, { call }) {
      const response = yield call(groupMemberDelete, { ...payload });
      if (callback) callback(response);
    },
    *root({ payload, callback }, { call, put }) {
      const response = yield call(root, { ...payload });
      yield put({
        type: 'saveRoot',
        payload: response,
      });
      if (callback) callback(response);
    },
    *groupList({ payload, callback }, { call, put }) {
      const response = yield call(groupList, { ...payload });
      console.log(response);
      yield put({
        type: 'saveGroupList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *memberList({ payload, callback }, { call, put }) {
      const response = yield call(memberList, { ...payload });
      yield put({
        type: 'saveMemberList',
        payload: response,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    saveInfo(state, { payload }) {
      return { ...state, info: payload || {} };
    },
    saveRoot(state, { payload }) {
      return { ...state, root: payload.data || {} };
    },
    saveGroupList(state, { payload }) {
      console.log(payload);
      return { ...state, groupList: payload || [] };
    },
    saveMemberList(state, { payload }) {
      return {
        ...state,
        memberTotal: payload?.total || 0,
        memberList: payload?.members || [],
      };
    },
  },
};
