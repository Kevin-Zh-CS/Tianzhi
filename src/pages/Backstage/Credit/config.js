import React from 'react';
import { Tag } from 'quanta-design';
import styles from './index.less';
import warningNoteIcon from '@/icons/warning_note.png';
import successNoteIcon from '@/icons/success_note.png';
import { getValidCredit } from '@/utils/helper';

export const SETTLE_STATUS_TAG = {
  '0': <Tag color="warning">待清算</Tag>,
  '1': <Tag color="processing">清算中</Tag>,
  '2': <Tag color="success">已清算</Tag>,
};

export const TX_TYPE = [
  {
    key: 0,
    value: '数据收入',
  },
  {
    key: 1,
    value: '数据支出',
  },
  {
    key: 2,
    value: '积分结算',
  },
];

// liquidation_status
export const LIQUIDATION_STATUS = [
  {
    key: 0,
    value: '待清算',
  },
  {
    key: 1,
    value: '清算中',
  },
  {
    key: 2,
    value: '已清算',
  },
];

export const SETTLE_STATUS = {
  waiting: 0,
  loading: 1,
  success: 2,
};

export const warning = <Tag color="warning">待确认</Tag>;

export const success = <Tag color="success">已确认</Tag>;

export const warningIcon = (
  <span className={styles.warning}>
    <img src={warningNoteIcon} alt="" />
    <span>待确认</span>
  </span>
);

export const successIcon = (
  <span className={styles.success}>
    <img src={successNoteIcon} alt="" />
    <span>已确认</span>
  </span>
);

export const getTotalBalance = total => {
  if (total > 0) return <span className={styles.success}>+ {getValidCredit(total)} Bx</span>;
  if (total === 0) return <span className={styles.success}>0.00 Bx</span>;
  return <span className={styles.error}>{getValidCredit(total)} Bx</span>;
};
