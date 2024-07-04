import React from 'react';
import { Result } from 'quanta-design';
import { connect } from 'dva';
import { noteTitleList, iconList, statusList, getDescList } from '@/pages/Share/Platform/config';
import styles from './index.less';

// 订单状态
// type: 0-积分 1-授权
// status: 0-待审核/待支付 1-审核通过/已支付 2-审核驳回/已取消
function OrderStatus(props) {
  const { orderDetail = {}, isProvider = 0, needKey } = props;
  const { od_status } = orderDetail;
  const arr = Object.keys(orderDetail);

  const colorList = [
    styles.success,
    styles.error,
    styles.warning,
    styles.success,
    styles.error,
    styles.success,
    styles.warning,
    styles.success,
    styles.default,
  ];

  return arr.length && od_status >= 0 ? (
    <div className={colorList[od_status]}>
      <Result
        icon={
          <img alt="" src={iconList[od_status]} width={54} height={54} style={{ float: 'left' }} />
        }
        status={statusList[od_status]}
        title={noteTitleList[od_status]}
        subTitle={
          <div>
            <p style={{ marginBottom: 12 }}>{getDescList(orderDetail, isProvider)}</p>
            {needKey || !orderDetail.app_key ? null : (
              <p>
                <span style={{ color: '#888888' }}>访问凭证</span>
                <span style={{ marginLeft: 20, color: '#292929' }}>{orderDetail.app_key}</span>
              </p>
            )}
          </div>
        }
      />
    </div>
  ) : null;
}

export default connect(({ datasharing }) => ({
  orderDetail: datasharing.orderDetail,
}))(OrderStatus);
