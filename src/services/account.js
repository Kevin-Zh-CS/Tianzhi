import { requestDownload } from '@/utils/request';
import promiseRequest from '@/utils/promiseRequest';
import md5 from 'md5';

/* 登录
  tel: String 电话
  password: String 密码
*/
export async function login({ tel = '', pwd = '' }) {
  return promiseRequest({
    url: '/api/v2/account/login',
    method: 'post',
    data: {
      tel,
      password: md5(`${pwd}b!txm#sh`),
    },
  });
}
/* 刷新 token
 */
export async function refreshToken() {
  return promiseRequest({
    url: `/api/v2/account/refresh-token`,
  });
}

/* 获取账号信息 */
export async function info() {
  return promiseRequest({
    url: `/api/v2/account/info`,
  });
}
/* 修改密码 */
export async function updatePwd({ oldPwd = '', newPwd = '' }) {
  return promiseRequest({
    url: `/api/v2/account/update-password`,
    method: 'post',
    data: {
      old_password: md5(`${oldPwd}b!txm#sh`),
      password: md5(`${newPwd}b!txm#sh`),
    },
  });
}
/* 更新用户名
  username 新用户名
*/
export async function updateName({ username = '' }) {
  return promiseRequest({
    url: `/api/v2/account/update-username`,
    method: 'post',
    data: { username },
  });
}
/* 分页返回用户列表
  page: 页码
  size: 大小
*/
export async function userList({
  isAsc = false,
  page = 1,
  size = 10,
  username = '',
  tel = '',
  status = -1,
}) {
  return promiseRequest({
    url: `/api/v2/account/user/list?is_asc=${isAsc}&page=${page}&size=${size}&username=${username}&tel=${tel}&status=${status}`,
  });
}
/* 重置用户密码
  tel 用户手机号
*/
export async function resetPwd({ tel = '' }) {
  return promiseRequest({
    url: `/api/v2/account/admin/reset-password`,
    method: 'POST',
    data: { tel },
  });
}
/* 禁用账号
  tel 用户手机号
*/
export async function disable({ tel = '' }) {
  return promiseRequest({
    url: `/api/v2/account/admin/disable`,
    method: 'POST',
    data: { tel },
  });
}
/* 启用账号
  tel 用户手机号
*/
export async function enable({ tel = '' }) {
  return promiseRequest({
    url: `/api/v2/account/admin/enable`,
    method: 'POST',
    data: { tel },
  });
}
/* 管理员单个用户导入
  name 用户姓名
  tel 用户手机号
*/
export async function register({ name = '', tel = '' }) {
  return promiseRequest({
    url: `/api/v2/account/admin/register`,
    method: 'POST',
    data: { name, tel },
  });
}
/* 管理员批量用户导入
[
  {
    index:
    name:
    tel:
  },
  ...
]
*/
export async function batchRegister({ fileList = [] }) {
  return promiseRequest({
    url: `/api/v2/account/admin/batch-register`,
    method: 'POST',
    data: fileList,
  });
}

export async function confirmBatchRegister({ fileList = [] }) {
  return promiseRequest({
    url: `/api/v2/account/admin/confirm-register`,
    method: 'POST',
    data: fileList,
  });
}
/* 下载批量用户导入模板 */
export async function template() {
  return requestDownload(`/api/v2/account/template`);
}
/* 下载用户私钥 */
export async function key() {
  return requestDownload(`/api/v2/account/key/download`);
}

export async function updateTel(tel) {
  return promiseRequest({
    url: `/api/v2/account/update-tel`,
    method: 'post',
    data: { tel },
  });
}
