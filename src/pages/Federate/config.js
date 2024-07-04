import { Tag } from 'quanta-design';
import React from 'react';

const warning_dark_background = { background: 'rgba(255, 173, 50, 0.1)' };
const error_dark_background = { background: 'rgba(229, 59, 67, 0.1)' };
const success_dark_background = { background: 'rgba(8, 203, 148, 0.1)' };

export const dark_background = { color: 'rgba(255, 255, 255, 0.9)' };

export const FEDERATE_STATE_TAG_DARK = [
  <Tag color="warning" style={warning_dark_background}>
    待完善
  </Tag>,
  null,
  null,
  null,
  null,
  <Tag color="warning" style={warning_dark_background}>
    待完善
  </Tag>,
  <Tag color="warning" style={warning_dark_background}>
    待审核
  </Tag>,
  <Tag color="error" style={error_dark_background}>
    审核驳回
  </Tag>,
  <Tag color="success" style={success_dark_background}>
    审核通过
  </Tag>,
  null,
  null,
  null,
];

export const MAIN_STATE_TAG = [
  <Tag color="warning" style={warning_dark_background}>
    待完善
  </Tag>,
  <Tag color="warning" style={warning_dark_background}>
    待完善
  </Tag>,
  <Tag color="warning" style={success_dark_background}>
    待部署
  </Tag>,
  <Tag color="success" style={success_dark_background}>
    可调用
  </Tag>,
  <Tag color="success" style={success_dark_background}>
    可调用
  </Tag>,
  <Tag color="success" style={success_dark_background}>
    可调用
  </Tag>,
];

export const MAIN_TASK_STATUS = {
  none: 0, // 初始状态
  wait: 1, // 等待完善（有邀请数据或者需审批等待处理）
  wait_deploy: 2, // 已完善等待部署
  deploy: 3, // 已部署
  executing: 4, // 执行中
  closed: 5, // 已关闭
};

export const DATA_STATUS = {
  wait_initiator_configure: 0, // 等待发起方配置
  wait_confirm_invite: 1, // 等待确认加入
  refuse_invite: 2, // 拒绝邀请
  pass_invite: 3, // 通过邀请
  wait_participant_configure: 4, // 等待参与方配置
  participant_configure_finish: 5, // 参与方配置完成
  wait_approval: 6, // 等待审批
  refuse_approval: 7, // 拒绝审批
  pass_approval: 8, // 通过审批
  ready: 9, // 已准备好
  deleted: 10, // 对于参与方来说已删除
  quited: 11, // 对于发起方来说已退出
};

// used_time
export const getUsedTime = time => {
  // eslint-disable-next-line
  const hour = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  // eslint-disable-next-line
  const minute = parseInt((time % (1000 * 60 * 60)) / (1000 * 60));
  // eslint-disable-next-line
  const millis = parseInt(time % 1000);
  // eslint-disable-next-line
  const second = parseInt((time % (1000 * 60)) / 1000);

  if (hour > 0) {
    return `${hour}h${minute}min`;
  }

  if (minute > 0) {
    return `${minute}min${second}s`;
  }

  if (second > 0) {
    return `${second}s${second}ms`;
  }

  return `${millis}ms`;
};

export const applyTip = (waiting_sub_list, taskState) => {
  if (taskState === MAIN_TASK_STATUS.deploy) {
    return '当前模型已部署，无法提交审核！';
  }

  if (!waiting_sub_list.length) {
    return '暂无需要提交审核的子模型，无法提交审核';
  }
  return '';
};

export const deployTip = (waiting_sub_list, fail_sub_list, modelList, taskState) => {
  if (taskState === MAIN_TASK_STATUS.deploy) {
    return '模型已部署，无需重新部署!';
  }

  if (waiting_sub_list.length) {
    return '还有待完善的子模型，不能部署模型!';
  }

  if (fail_sub_list.length) {
    return '还有未审核通过的子模型，不能部署模型！';
  }

  if (!modelList.length) {
    return '尚无子模型，不能部署模型！';
  }
  return '';
};
