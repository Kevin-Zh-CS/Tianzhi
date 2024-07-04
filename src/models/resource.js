import {
  resourceCreate,
  resourceDelete,
  resourceInfo,
  resourceUpdate,
  searchMembers,
  getMemberList,
  modifyMember,
  addMember,
  getSourceList,
} from '@/services/resource';

export default {
  namespace: 'resource',
  state: {
    resourceList: [],
    resourceInfo: {},
    members: [],
    namespaceMemberList: {
      member_list: [],
      total: 0,
    },
    resourceMemberList: [],
  },
  effects: {
    *resourceList({ payload, callback }, { call, put }) {
      const response = yield call(getSourceList, { ...payload });
      yield put({
        type: 'saveResourceList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *resourceInfo({ payload, callback }, { call, put }) {
      const response = yield call(resourceInfo, { ...payload });
      yield put({
        type: 'saveResourceInfo',
        payload: response,
      });
      if (callback) callback(response);
    },
    *resourceCreate({ payload, callback }, { call }) {
      const response = yield call(resourceCreate, { ...payload });
      if (callback) callback(response);
    },
    *resourceUpdate({ payload, callback }, { call }) {
      const response = yield call(resourceUpdate, { ...payload });
      if (callback) callback(response);
    },
    *resourceDelete({ payload, callback }, { call }) {
      const response = yield call(resourceDelete, { ...payload });
      if (callback) callback(response);
    },
    *searchMembers({ payload, callback }, { call, put }) {
      const response = yield call(searchMembers, { ...payload });
      yield put({
        type: 'saveMembers',
        payload: response.sort((a, b) => a.name.localeCompare(b.name, 'zh')),
      });
      if (callback) callback(response);
    },
    *getNamespaceMemberList({ payload, callback }, { call, put }) {
      const response = yield call(getMemberList, { ...payload });
      yield put({
        type: 'saveNamespaceMemberList',
        payload: response,
      });
      if (callback) callback(response);
    },
    *getResourceMemberList({ payload, callback }, { call, put }) {
      const response = yield call(getMemberList, { ...payload });
      let data = [];
      if (response) {
        [0, 1, 2, 3].forEach(item => {
          data = data.concat(
            response.member_list
              .filter(_item => _item.role === item)
              .sort((a, b) => a.name.localeCompare(b.name, 'zh')),
          );
        });
      }
      yield put({
        type: 'saveResourceMemberList',
        payload: data,
      });
      if (callback) callback(response);
    },
    *modifyMember({ payload, callback }, { call }) {
      const response = yield call(modifyMember, { ...payload });
      if (callback) callback(response);
    },
    *addMember({ payload, callback }, { call }) {
      const response = yield call(addMember, { ...payload });
      if (callback) callback(response);
    },
  },

  reducers: {
    saveResourceList(state, { payload }) {
      return { ...state, resourceList: payload || [] };
    },
    saveResourceInfo(state, { payload }) {
      return { ...state, resourceInfo: payload || {} };
    },
    saveMembers(state, { payload }) {
      return { ...state, members: payload || [] };
    },
    saveNamespaceMemberList(state, { payload }) {
      return {
        ...state,
        namespaceMemberList: payload || {
          member_list: [],
          total: 0,
        },
      };
    },
    saveResourceMemberList(state, { payload }) {
      return { ...state, resourceMemberList: payload || [] };
    },
  },
};
