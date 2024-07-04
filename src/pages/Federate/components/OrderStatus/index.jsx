import React from 'react';
import { Result } from 'quanta-design';
import styles from './index.less';

// 状态卡片
// status: 0-warning 1-error 2-success 3-info
function OrderStatus({ status = 0, title = '', subTitle = '', ...restProps }) {
  const statusList = ['warning', 'error', 'success', 'info'];
  const colorList = [styles.warning, styles.error, styles.success, styles.info];
  return (
    <div className={colorList[status % 4]} {...restProps}>
      <Result status={statusList[status % 4]} title={title} subTitle={subTitle} />
    </div>
  );
}

export default OrderStatus;
