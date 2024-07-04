/* eslint-disable no-template-curly-in-string */
import React from 'react';
import { Tag } from 'quanta-design';

/*  隐私计算：数据状态 + 子模型状态
  0等待发起方配置
  1等待确认加入
  2拒绝邀请
  3通过邀请
  4等待参与方配置
  5参与方配置完成
  6等待审批
  7拒绝审批
  8通过审批
  9已准备好
  10对于参与方来说已删除
  11对于发起方来说已退出
*/

export const authList = [
  { key: 0, value: '积分共享', type: 'auth' },
  { key: 1, value: '授权共享', type: 'auth' },
  { key: 2, value: '公开共享', type: 'auth' },
];
export const statusList = [
  { key: 0, value: '未授权', type: 'status' },
  { key: 1, value: '已授权', type: 'status' },
];
export const typeList = [
  { key: 0, value: '文件', type: 'type' },
  { key: 1, value: '接口', type: 'type' },
  { key: 2, value: '模型', type: 'type' },
  { key: 3, value: '数据源', type: 'type' },
];

export const STATUS_LIST = {
  get_success: 0,
  cancel: 1,
  pending_approval: 2,
  pay_success: 3,
  approval_reject: 4,
  paid: 5,
  pending_pay: 6,
  unknown: 7,
  valid: 8,
};

// 订单类型
export const ORDER_TYPE = {
  credit: 0, // 积分
  auth: 1, // 授权
  publish: 2, // 共享
  unsupport: 3,
};

// 数据类型
export const DATA_TYPE_LIST = {
  file: 0, // 文件
  restful: 1, // 接口
  model: 2, // 模型
  datasource: 3, // 数据源
};

export const DATA_DETAIL_STATUS_LIST = [
  '获取成功',
  '已取消',
  '待审核',
  '审核通过',
  '审核驳回',
  '已支付',
  '待支付',
  '获取成功',
  '已失效',
];

export const topicList = [
  { key: 0, value: '科创信息', type: 'theme' },
  { key: 1, value: '公共信息', type: 'theme' },
  { key: 2, value: '资源信息', type: 'theme' },
  { key: 3, value: '金融信息', type: 'theme' },
  { key: 4, value: '隐私信息', type: 'theme' },
];

export const DATA_THEME = [
  { key: 0, value: '科创信息', type: 'topic' },
  { key: 1, value: '公共信息', type: 'topic' },
  { key: 2, value: '资源信息', type: 'topic' },
  { key: 3, value: '金融信息', type: 'topic' },
  { key: 4, value: '隐私信息', type: 'topic' },
];

export const DATA_MODEL_STATE = {
  WAIT_SPONSOR_SETTING: 0,
  DATA_WAIT_ACCEPT: 1,
  DATA_REJECT: 2,
  DATA_PASS: 3,
  WAIT_PARTNER_SETTING: 4,
  DATA_SETTED: 5,
  MODEL_WAIT_APPROVE: 6,
  MODEL_REJECT: 7,
  MODEL_PASS: 8,
  MODEL_READY: 9,
  DATA_DELETED: 10,
  DATA_EXIST: 11,
};
export const DATA_STATE_TAG = [
  null,
  <Tag color="warning">待接受</Tag>,
  <Tag color="error">已拒绝</Tag>,
  <Tag color="processing">待添加</Tag>,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];
export const DATA_STATE_LIST_TAG = [
  <Tag color="success">已添加</Tag>,
  <Tag color="warning">待接受</Tag>,
  <Tag color="error">已拒绝</Tag>,
  <Tag color="processing">待添加</Tag>,
  null,
  <Tag color="success">已添加</Tag>,
  <Tag color="success">已添加</Tag>,
  <Tag color="success">已添加</Tag>,
  <Tag color="success">已添加</Tag>,
  null,
  <Tag color="default">已失效</Tag>,
];
export const MODEL_STATE_TAG = [
  <Tag color="warning">待完善</Tag>,
  null,
  null,
  null,
  null,
  <Tag color="warning">待完善</Tag>,
  <Tag color="warning">待审核</Tag>,
  <Tag color="error">审核驳回</Tag>,
  <Tag color="success">审核通过</Tag>,
  null,
  <Tag color="default">已失效</Tag>,
  <Tag color="default">已失效</Tag>,
];
export const MODEL_STATE_TAG_DARK = [
  <Tag color="warning" style={{ background: 'rgba(255, 173, 50, 0.1)' }}>
    待完善
  </Tag>,
  null,
  null,
  null,
  null,
  <Tag color="warning" style={{ background: 'rgba(255, 173, 50, 0.1)' }}>
    待完善
  </Tag>,
  <Tag color="warning" style={{ background: 'rgba(255, 173, 50, 0.1)' }}>
    待审核
  </Tag>,
  <Tag color="error" style={{ background: 'rgba(229, 59, 67, 0.1)' }}>
    审核驳回
  </Tag>,
  <Tag color="success" style={{ background: 'rgba(8, 203, 148, 0.1)' }}>
    审核通过
  </Tag>,
  null,
  null,
  null,
];
export const TASK_VISIBILITY_TAG = [
  <Tag color="processing" bordered>
    内部公开
  </Tag>,
  <Tag color="warning" bordered>
    部分可见
  </Tag>,
];

export const PROJECT_STATUS_TAG = [
  null,
  null,
  <Tag color="warning">待接受</Tag>,
  <Tag color="processing">待添加</Tag>,
  <Tag color="error">已拒绝</Tag>,
  null,
  null,
  null,
  null,
];

export const PROJECT_PARTNER_STATUS_TAG = [
  null,
  null,
  <Tag color="warning">待接受</Tag>,
  <Tag color="processing">待添加</Tag>,
  <Tag color="error">已拒绝</Tag>,
  <Tag color="success">已添加</Tag>,
  <Tag color="success">已添加</Tag>,
  <Tag color="default">已失效</Tag>,
  null,
];

export const PROJECT_STATUS = {
  INIT: 0,
  INITIATOR_CONFIGURE_FINISHED: 1,
  WAIT_ACCEPT_INVITE: 2,
  WAIT_PARTICIPANT_CONFIGURE: 3,
  PARTICIPANT_REJECT: 4,
  PARTICIPANT_CONFIGURE_FINISHED: 5,
  READY: 6,
  DELETED: 7,
};
/*  隐私计算：任务状态
  0初始状态
  1等待完善（有邀请数据或等待审批）
  2已完善等待部署
  3已部署
  4执行中
  5已关闭
*/
export const TASK_STATE = {
  INIT: 0,
  PROCESS: 1,
  PASS: 2,
  DEPLOYED: 3,
  READY: 4,
  CLOSED: 5,
};
export const TASK_STATE_TAG = [
  <Tag color="warning">待完善</Tag>,
  <Tag color="warning">待完善</Tag>,
  <Tag color="warning">待部署</Tag>,
  <Tag color="success">可调用</Tag>,
  <Tag color="processing">执行中</Tag>,
  <Tag color="default">已关闭</Tag>,
];
/*  隐私计算：数据添加方式
  0空
  1本地获取的appkey数据
  2本地导入的数据
  3邀请的数据
*/
export const DATA_JOIN_TYPE = {
  INITIATOR_NULL: 0,
  LOCAL_APPKEY: 1,
  LOCAL_IMPORT: 2,
  INVITED: 3,
};
/*  隐私计算：导入数据隐私等级
 */
export const PRIVATE_TYPE = ['不限', '仅限MPC隐私计算'];
export const PRIVATE_TYPE_LIST = { false: '不限', true: '仅限MPC隐私计算' };
export const APPROVE_CONTENT = ['子模型+主模型', '子模型'];
// approve_content
/*  共享平台：授权订单状态
 */
export const ORDER_STATE = [
  <Tag color="success">已获取</Tag>,
  <Tag>已取消</Tag>,
  <Tag color="warning">待审核</Tag>,
  <Tag color="success">审核通过</Tag>,
  <Tag color="error">审核驳回</Tag>,
  <Tag color="success">已支付</Tag>,
  <Tag color="warning">待支付</Tag>,
  <Tag color="success">已获取</Tag>,
  <Tag color="default">已失效</Tag>,
];
/*  共享平台：数据类型
  0文件
  1接口
  2模型
  3数据源
*/
export const DATA_TYPE = [
  { key: 0, value: '文件' },
  { key: 1, value: '接口' },
  { key: 2, value: '模型' },
  { key: 3, value: '数据源' },
];

export const MESSAGE_TYPE = ['default', 'warning', 'success', 'error'];

export const USER_STATUS_TYPE = [
  { key: 2, value: '使用中' },
  { key: 3, value: '已禁用' },
];

export const MODEL_STATUS_TYPE = [
  { key: 0, value: '已获取' },
  { key: 2, value: '待审核' },
  { key: 3, value: '审核通过' },
  { key: 4, value: '审核驳回' },
];

export const ORDER_STATE_TYPE = [
  { key: 1, value: '已取消' },
  { key: 2, value: '待支付' },
  { key: 5, value: '已支付' },
];

export const ORG_NAME = [
  { key: '趣链科技', value: '趣链科技' },
  { key: '杭州趣链科技有限公司', value: '杭州趣链科技有限公司' },
];

export const DATA_TYPE_TEXT = ['文件', '接口', '模型', '数据源', '数据库', '数据导入', '信息摘要'];
export const DATA_TOPIC_TEXT = ['科创信息', '公共信息', '资源信息', '金融信息', '隐私信息'];

/*  共享平台：发布类型
  0授权
  1积分
*/
export const PUBLISH_TYPE = {
  AUTH: 0,
  CREDIT: 1,
};
export const PUBLISH_STATUS = ['未发布', '已发布', '已下架'];

export const PUBLISH_TYPE_TEXT = ['积分', '授权', '公开'];

export const DEPARTMENT_TYPE_TEXT = ['部门管理员', '部门成员'];

export const DATA_RESOURCE_TEXT = ['上传数据', '关联数据库'];

export const ARGS_TYPE_TEXT = ['String', 'Integer', 'Float'];

export const PERMISSION = {
  create: 0,
  query: 1,
  usage: 2,
  member_manage: 3,
  edit: 4,
  del: 5,
  publish: 6,
  edit_member_role: 7,
};

export const CHART_COLOR = {
  hex: [
    '#6289F2',
    '#58CD7A',
    '#5B6B9C',
    '#F6BD16',
    '#F2665C',
    '#6ACCF2',
    '#A26BFE',
    '#ED954C',
    '#5FC9C8',
    '#EF649D',
    '#553EB2',
    '#66B2F1',
    '#9ACF46',
    '#DD7E6A',
    '#E3E447',
    '#4184C4',
    '#B24ED9',
    '#D5743C',
    '#42A6E5',
    '#CA59B4',
    '#D0E1FF',
    '#C0F2C9',
    '#FCEE9C',
    '#FFD5CD',
    '#C4F4FF',
    '#E0C7FF',
    '#FFE1BC',
    '#BAE9E2',
    '#FFDEEA',
    '#CDD3E0',
  ],
  rgba: [
    '98, 137, 242',
    '88, 205, 122',
    '91, 107, 156',
    '246, 189, 22',
    '242, 102, 92',
    '106, 204, 242',
    '162, 107, 254',
    '237, 149, 76',
    '95, 201, 200',
    '239, 100, 157',
    '85, 62, 178',
    '102, 178, 241',
    '154, 207, 70',
    '221, 126, 106',
    '227, 228, 71',
    '65, 132, 196',
    '178, 78, 217',
    '213, 116, 60',
    '66, 166, 229',
    '202, 89, 180',
    '208, 225, 255',
    '192, 242, 201',
    '252, 238, 156',
    '255, 213, 205',
    '196, 244, 255',
    '224, 199, 255',
    '255, 225, 188',
    '186, 233, 226',
    '255, 222, 234',
    '205, 211, 22',
  ],
};

export const USER_STATE = {
  NOT_LOGIN: -1,
  WAITTING: 0,
  FIRST: 1,
  PASS: 2,
  FAIL: 3,
};
export const ACCOUNT_STATUS_TAG = [
  null,
  <Tag color="success">使用中</Tag>,
  <Tag color="success">使用中</Tag>,
  <Tag color="default">已禁用</Tag>,
];
/*  权限：公开类型
1表示部分可见
2表示内部公开
*/
export const VISIBLE_TYPE = ['', '部分可见', '内部公开'];

// 0文件，1接口，2模型，3数据源，4数据库，5数据导入，6信息摘要
export const RES_TYPE = {
  file: 0,
  interface: 1,
  model: 2,
  origin: 3,
  database: 4,
  dataImport: 5,
  message: 6,
};

// error code enum
export const ERROR_CODE = {
  // 合约
  10001: 'extra字段json反序列化',
  10002: '没有操作权限',
  10021: '用户不存在',
  10022: '用户已经存在',
  10023: '机构不存在',
  10024: 'BitXMesh节点已经注册',
  10025: '申请时长不存在',
  10026: '申请用户不存在',
  10027: '共享数据不存在',
  10028: '无法申请使用自己发布的数据',
  10029: '订单不存在',
  10030: '订单已经被处理',
  10031: '页序号不能小于等于0',
  10032: '页大小不能小于0',
  10033: '该数据类型不存在',
  10034: '发布用户不存在',
  10035: '发布数据已经存在',
  10036: '节点 ID 或 AppKey 错误',
  10037: '同步消息序号不能小于0',
  10038: '同步消息序号大于当前日志大小',
  10039: '申请者积分不足',

  // SDK
  10100: 'unknown error',
  10130: 'group members is empty',
  10131: "group's user id is empty",
  10132: 'file is exist',
  10133: 'current params not support,only String,Long,Double',
  10134: 'fileName is a directory not a file',
  10135: 'req response is empty',
  10136: 'file create error',
  10137: 'grpc provider has not constructed',
  10138: 'node alias already existed',
  10139: 'currently, multi-hash queries are not supported',
  10140: 'client stub is null',
  10141: "can not find current name's node",
  10142: 'node name error,not found',
  10143: 'node config info say no used tls',
  10145: 'no specified node are included',
  10146: 'node config say use tls,but cert is null',
  10147: 'channels with associated names do not exist',
  10148: 'node certs is not configured',
  10149: 'corresponding cert is not found',
  10150: 'current channel is not active',
  10151: 'pub status error',
  10152: 'file type error',
  10153: 'resource type error',
  10154: 'unsupported execute type',
  10155: 'approval status error',
  10156: 'namespace member type error',
  10157: 'provide params error',
  10158: 'invoke params must be proto message',
  10159: 'current params only support Double,Long,String',
  10160: 'json deserialize failed',
  10161: 'uploading file, server error',
  10162: 'group member type error',
  10163: 'list page info error',
  10164: 'new onwer same with old owner',
  10165: 'member size overflow',

  // public
  10201: 'unknown error',
  10202: 'invalid signature',
  10203: '没有操作权限',
  10204: 'blockchain not configured to open',
  10205: 'nil request',
  10206: 'nil http body',
  10207: 'current version is not dev',
  10208: 'blockchain request time out',
  10209: 'namespace error',
  10210: 'search option error',
  10211: 'repeated transaction',
  10212: 'No Such Event Type',
  10213: 'search file error',
  10214: 'search model error',
  10215: 'search restful error',
  10216: 'search data source error',
  10251: 'BitXMesh SDK初始化错误',
  10252: '超级管理员载入错误',
  10253: 'token错误',
  10254: '参数校验错误',
  10255: '系统错误',
  10256: '权限错误',
  10257: '数据类型错误',

  // file
  10301: '文件不存在',
  10302: '文件已存在',
  10303: 'path must not be empty',
  10304: '路径名必须以 / 为开头',
  10305: '文件路径不能以 / 为结尾',
  10306: 'file name must not be empty',
  10307: '添加文件时，前置文件夹不存在',
  10308: '删除文件夹应该设置 recursive 参数为 true',
  10309: 'dir not exist',
  10310: 'cannot delete root path',
  10311: 'file did error',
  10351: '文件名或路径名错误',

  // model
  10401: '模型已存在',
  10402: '目标模型没有找到',
  10403: '该名称已被占用，请输入其他名称',
  10404: 'model has already published',
  10405: 'model must not be empty',
  10406: 'model name must not be empty',
  10407: 'model did error',
  10451: '上传的模型文件不是lua类型',

  // restful
  10503: '接口名称重复',
  10509: '接口校验失败，请检查后重试',
  10551: '无法与接口建立连接',
  10552: '无法关闭与目的接口的连接',

  // datasource
  10601: 'Hash Calculate error',
  10602: 'datasource already existed',
  10603: 'datasource has published',
  10604: 'convert pb message error',
  10605: 'convert datasource pb message error',
  10606: 'datasource has already published',
  10607: 'datasource not existed',
  10608: 'datasource method model deploy res error',

  // database
  10701: 'database has already existed',
  10702: 'database type not supported',
  10703: '数据库连接失败',
  10704: '数据库已连接',
  10705: 'database config is not existed',
  10706: 'current namespaces database not existed',
  10707: 'this type database is not support',
  10708: 'database query error',
  10709: 'database generated model deploy error',
  10710: 'this field can not be found in the table of current database',
  10711: 'this table is not exist in current database',
  10751: '数据库查询失败',
  10752: '对应的参数错误',

  // account
  10801: '审核失败，用户已存在',
  10802: 'user not existed',
  10803: 'no user update info found',
  10804: 'user id overflow',
  10805: 'invalid user id',
  10806: 'invalid register op',
  10807: 'can not remove root account',
  10851: '超级管理员不存在',
  10852: '超级管理员密钥错误',
  10853: '该手机号已在平台注册',
  10854: '手机号或密码错误',
  10855: '该管理员已注册',
  10856: '用户当前状态无法审核',
  10857: '用户状态非法',
  10858: '当前用户未注册',
  10859: '手机号为空',
  10860: '参数格式错误',
  10861: '密码连续输错超过5次，请10分钟后再试',
  10862: '当前登录用户已被禁用！',
  10863: '请输入与原密码不同的新密码',
  10864: '该手机号格式不规范',
  10865: '用户名格式错误,可能存在非法字符',
  20800: '系统内部错误',
  20803: '用户名为空',

  // grant
  10901: '权限不允许',
  10902: '资源不存在',
  10903: '未知错误',
  10904: '账户在这个资源上已经有一个角色了',
  10905: '该名称已被占用，请输入其他名称',
  10906: '资源类型不存在',
  10907: '账户不存在',
  10908: '账户已经存在',
  10909: '该名称已被占用，请输入其他名称',

  // datasharing
  11001: 'resource not exist',
  11002: 'resource has already published',
  11003: 'can not publish folder',
  11051: '申请者与数据在同一机构内',
  11052: '订单不存在',
  11053: '授权记录不存在',
  11054: '本订单已被处理',

  // fc
  11101: '数据已存在，请勿重复添加',
  11102: '该子模型不存在',
  11103: 'the contract has requested approval',
  11104: 'the model status is invalid',
  11105: '任务已经存在',
  11106: 'appkey对应的数据类型错误，应为接口、模型或者数据源',
  11107: '该名称已被占用，请输入其他名称',
  11108: 'can not found this task',
  11109: 'can not found this involved task',
  11110: '添加的数据不能为本节点发布的数据',
  11151: '成员不存在',

  // group
  11201: '组已存在',
  11202: '组不存在',
  11203: '用户已经在组中',
  11204: '用户不在组中',
  11205: '组操作，权限不允许',
  11206: '组id溢出',
  11207: '组不能成为管理员',
  11208: '该名称已被占用，请输入其他名称',
  11251: '部门成员角色错误',
  11252: '部门成员不存在',

  // namespace
  11501: 'namespace已经存在',
  11502: 'namespace不存在',
  11503: '成员已经存在',
  11504: '成员不存在',
  11505: '该用户不存在',
  11506: '非法的namespace名字',
  11507: 'namespace resid不应该设置',
  11508: '当前节点中该名称已被占用，请输入其他名称',

  // fc
  11601: '节点 ID 或 AppKey 错误',
  11602: '不能使用其它机构申请的 AppKey',

  // role
  11701: '角色id格式不合法',
  11702: '角色已经存在',
  11703: '角色正在被使用',
  11704: '角色不存在',
  11705: '角色权限非法',
  11706: '角色id溢出',
  11707: '角色名字非法，应该不为空',
  11708: '该名称已被占用，请输入其他名称',
  17100: '本机构节点数据，无法购买',

  // peer
  11801: 'get disk space info error',

  // chain
  11901: 'appkey被冻结',
  11902: 'appkey已经过期，请检查使用的有效期',
  11903: '无效的appkey,没有可使用数量',
  11904: '链上获取appkey详情出错',
  11905: 'appkey的格式错误，请检查appkey长度',
  11906: '数据hash出错',
  11907: '校验远程节点appkey请求超时',
  11951: '未知的数据类型',
  11952: '同步链上组织信息出错',

  // fc v2
  12001: '任务不存在',
  12002: '模型名称重复',
  12003: 'appkey 数据重复',
  12004: '当前任务状态无法执行，请重新部署',
  12005: '待审核的子模型不能更新！',
  12006: '当前数据类型无法执行',
  12007: '任务数据不存在',
  12008: '任务已被终止',
  12009: '任务未执行',

  // import
  12108: '无法将此参数强制转换为其他类型',
};
