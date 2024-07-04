import promiseRequest from '@/utils/promiseRequest';

/* 获取机构信息
 */
export async function info() {
  return promiseRequest({
    url: `/api/v2/org/info`,
  });
}

/* 列出该机构开发的模块
 */
export async function getOpenModules() {
  return promiseRequest({
    url: `/api/v2/org/open-modules`,
  });
}

// /api/v2/department/members/depart-tree 以树形结构列出该机构的所有部门

export async function getDepartTree() {
  const dataList = await promiseRequest({
    url: `/api/v2/department/members/depart-tree`,
    method: 'get',
  });
  return dataList;
}
/* 创建部门
  groupId: 父部门id
  name: 子部门名称
 */
export async function groupAdd({ groupId = '', name = '' }) {
  return promiseRequest({
    url: `/api/v2/department/add?group_id=${groupId}`,
    method: 'POST',
    data: {
      name,
    },
  });
}
/* 删除部门
 */
export async function groupDelete({ groupId = '' }) {
  return promiseRequest({
    url: `/api/v2/department/delete`,
    method: 'post',
    data: {
      group_id: groupId,
    },
  });
}
/* 添加部门成员
 */
export async function groupMemberAdd({ groupId = '', members = [] }) {
  return promiseRequest({
    url: `/api/v2/department/member/add`,
    method: 'POST',
    data: {
      group_id: groupId,
      members,
    },
  });
}
/* 批量删除部门成员
 */
export async function groupMemberBatchDelete({ groupId = '', members = [] }) {
  return promiseRequest({
    url: `/api/v2/department/member/batch-rm`,
    method: 'DELETE',
    data: {
      group_id: groupId,
      members,
    },
  });
}
/* 删除部门成员
 */
export async function groupMemberDelete({ groupId = '', memId = '' }) {
  return promiseRequest({
    url: `/api/v2/department/member/rm`,
    method: 'post',
    data: {
      group_id: groupId,
      mem_id: memId,
    },
  });
}
/* 模糊查找
 */
export async function search({ groupId = '', member = '' }) {
  return promiseRequest({
    url: `/api/v2/department/member/search?group_id=${groupId}&member${member}`,
  });
}
/* 更新部门成员角色
 */
export async function roleUpdate({ groupId = '', memId = '', role = 0 }) {
  return promiseRequest({
    url: `/api/v2/department/member/update`,
    method: 'post',
    data: {
      group_id: groupId,
      mem_id: memId,
      new_role: role,
    },
  });
}
/* 重命名部门
 */
export async function nameUpdate({ groupId = '', name = '' }) {
  return promiseRequest({
    url: `/api/v2/department/rename`,
    method: 'POST',
    data: {
      group_id: groupId,
      name,
    },
  });
}

// 获取根节点（机构）
export async function getRoot() {
  // return request(`/api/v2/department/root`);
  const data = await promiseRequest({
    url: `/api/v2/department/root`,
    method: 'get',
  });
  return data;
}

export async function getNode() {
  return promiseRequest({
    url: `/api/v1/qfl/node/info`,
    method: 'get',
  });
}

export async function updateNode(data) {
  return promiseRequest({
    url: `/api/v1/qfl/node/update`,
    method: 'post',
    data,
  });
}

// /api/v1/qfl/node/stop
export async function stopNode() {
  return promiseRequest({
    url: `/api/v1/qfl/node/stop`,
    method: 'post',
  });
}

export async function startNode() {
  return promiseRequest({
    url: `/api/v1/qfl/node/start`,
    method: 'post',
  });
}

// 根据组id获取子部门
export async function groupList({ groupId = '' }) {
  return promiseRequest({
    url: `/api/v2/department/members/depart?group_id=${groupId}`,
  });
}
/* 获取部门成员
 */
export async function memberList({ groupId = '', page = 1, size = 10, isAsc = false }) {
  return promiseRequest({
    url: `/api/v2/department/members?is_asc=${isAsc}&page=${page}&size=${size}&group_id=${groupId}`,
  });
}

// /api/v2/org/update
export async function updateOrg(data) {
  return promiseRequest({
    url: `/api/v2/org/update`,
    method: 'post',
    data,
  });
}

// /api/v2/authority/get-perm-settings

export async function getPermSetting(data, dispatch) {
  const dataList = await promiseRequest({
    url: `/api/v2/authority/get-perm-settings`,
    data,
    dispatch,
  });

  return dataList.list || [];
}

// /api/v2/authority/update-role-operations
export async function updateRole(data) {
  return promiseRequest({
    url: `/api/v2/authority/update-role-operations`,
    method: 'post',
    data,
  });
}

// /api/v2/authority/list-perm-settings
export async function getRoleSettingList(dispatch) {
  return promiseRequest({
    url: `/api/v2/authority/list-perm-settings`,
    dispatch,
  });
}
