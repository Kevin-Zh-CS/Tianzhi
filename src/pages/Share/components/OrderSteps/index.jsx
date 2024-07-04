import React from 'react';
import { connect } from 'dva';
import { Steps } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { ORDER_TYPE } from '@/utils/enums';
import styles from './index.less';

// 订单步骤
// type: 0-积分 1-授权
// status: 0-待审核/待支付 1-审核通过/已支付 2-审核驳回/已取消
function OrderSteps(props) {
  const { orderDetail = {} } = props;
  const arr = Object.keys(orderDetail);
  const type = orderDetail.order_type || 0;
  const order_status = orderDetail.od_status;
  const titleList = [
    ['下单数据', '支付订单', '完成'],
    ['申请授权', '数据提供方审核', '完成'],
    ['获取数据', '完成'],
  ];

  let finishStatus = 0;
  let stepStatus = '';
  if (order_status === 0 || order_status === 3 || order_status === 5 || order_status === 8) {
    finishStatus = 3;
    stepStatus = 'success';
  } else if (order_status === 2 || order_status === 6) {
    finishStatus = 1;
    stepStatus = 'process';
  } else {
    finishStatus = 1;
    stepStatus = 'error';
  }

  return arr.length === 0 ? (
    <></>
  ) : (
    <Steps
      className={`container-card ${styles.step}`}
      type="navigation"
      current={finishStatus}
      status={stepStatus}
    >
      <Steps.Step
        title={titleList[type][0] || ''}
        description={
          <>
            <span style={{ display: 'block' }}>{orderDetail.apply_name}</span>
            <span>{formatTime(orderDetail.created_time)}</span>
          </>
        }
      />
      <Steps.Step
        title={titleList[type][1] || ''}
        description={
          <>
            <span style={{ display: 'block' }}>
              {orderDetail.order_type !== ORDER_TYPE.credit
                ? orderDetail.provider_name
                : orderDetail.apply_name}
            </span>
            <span>
              {orderDetail.examine_time && orderDetail.od_status !== 2
                ? formatTime(orderDetail.examine_time)
                : ''}
            </span>
          </>
        }
      />
      {titleList[type].length > 2 ? (
        <Steps.Step
          title={titleList[type][2] || ''}
          description={<span style={{ display: 'block' }}>{orderDetail.apply_name}</span>}
        />
      ) : null}
    </Steps>
  );
}

export default connect(({ datasharing }) => ({
  orderDetail: datasharing.orderDetail,
}))(OrderSteps);
