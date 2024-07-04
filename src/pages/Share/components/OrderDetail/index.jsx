import React, { useState } from 'react';
import { Descriptions, Button, Tooltip } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import {
  DATA_TYPE_TEXT,
  DATA_THEME,
  STATUS_LIST,
  ORDER_TYPE,
  DATA_DETAIL_STATUS_LIST,
  APPROVE_CONTENT,
  PRIVATE_TYPE_LIST,
} from '@/utils/enums';
import { connect } from 'dva';
import router from 'umi/router';
import PassModal from './PassModal';
import RejectModal from './RejectModal';
import styles from './index.less';
import {
  getApplyCount,
  getApplyTimer,
  getValidCount,
  getValidTimer,
  toFixPrice,
} from '@/utils/helper';
import { getOrderType } from '@/pages/Share/Platform/config';

// 订单信息
// type: 0-积分 1-授权
// status: 0-待审核2/待支付6 1-审核通过/已支付 2-审核驳回/已取消
function OrderDetail(props) {
  const { orderDetail = {}, isProvider = 0, ...restProps } = props;
  const { od_status, order_type, data_type } = orderDetail;
  const [isPassModal, setIsPassModal] = useState(false);
  const [isRejectModal, setIsRejectModal] = useState(false);

  const handlePass = () => {
    setIsPassModal(!isPassModal);
  };

  const handleReject = () => {
    setIsRejectModal(!isRejectModal);
  };

  const goToRequestData = () => {
    router.push(
      `/share/obtain/request?id=${orderDetail.order_id}&data_id=${orderDetail.data_id}&type=${data_type}`,
    );
  };

  const getRecordData = () => {
    if (!Number(isProvider)) {
      if (
        od_status === STATUS_LIST.pay_success ||
        od_status === STATUS_LIST.paid ||
        od_status === STATUS_LIST.get_success ||
        od_status === STATUS_LIST.valid
      ) {
        return (
          <Tooltip title={od_status === STATUS_LIST.valid ? '该数据已失效，无权限请求！' : ''}>
            <Button
              disabled={od_status === STATUS_LIST.valid}
              type="primary"
              onClick={goToRequestData}
              style={{ marginTop: -4, marginRight: 4 }}
            >
              请求数据
            </Button>
          </Tooltip>
        );
      }
    }
    return null;
  };

  return (
    <>
      {/* 授权订单-不在白名单，申请的数据 */}
      {order_type === ORDER_TYPE.auth &&
      (orderDetail.od_status === STATUS_LIST.pending_approval ||
        orderDetail.od_status === STATUS_LIST.pending_pay ||
        orderDetail.od_status === STATUS_LIST.pay_success ||
        orderDetail.od_status === STATUS_LIST.approval_reject ||
        orderDetail.od_status === STATUS_LIST.valid) ? (
        <div style={{ marginTop: 12 }}>
          <Descriptions title="申请信息" column={2} className="container-card" {...restProps}>
            <Descriptions.Item label="有效时间">
              {getApplyTimer(order_type, orderDetail.apply_duration)}
            </Descriptions.Item>
            <Descriptions.Item label="有效次数">
              {getApplyCount(order_type, orderDetail.apply_amount)}
            </Descriptions.Item>
            <Descriptions.Item label="申请理由" span={2}>
              {orderDetail.apply_reason || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
      <Descriptions
        title="订单信息"
        column={2}
        className="container-card"
        labelStyle={{ width: 76 }}
        {...restProps}
      >
        <Descriptions.Item label="订单编号">{orderDetail.order_id}</Descriptions.Item>
        <Descriptions.Item label="订单状态">{DATA_DETAIL_STATUS_LIST[od_status]}</Descriptions.Item>
        <Descriptions.Item label="有效时间">
          {orderDetail.od_status === STATUS_LIST.pending_approval ||
          orderDetail.od_status === STATUS_LIST.approval_reject
            ? '-'
            : getValidTimer(order_type, orderDetail)}
        </Descriptions.Item>
        <Descriptions.Item label="有效次数">
          {orderDetail.od_status === STATUS_LIST.pending_approval ||
          orderDetail.od_status === STATUS_LIST.approval_reject
            ? '-'
            : getValidCount(order_type, orderDetail)}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        title="数据信息"
        column={2}
        className="container-card"
        labelStyle={{ width: 76 }}
        {...restProps}
        extra={getRecordData()}
      >
        <Descriptions.Item label="数据标题">{orderDetail.data_name}</Descriptions.Item>
        <Descriptions.Item label="数据哈希">
          {orderDetail.data_hash || orderDetail.data_id}
        </Descriptions.Item>
        <Descriptions.Item label="数据类型">{DATA_TYPE_TEXT[data_type]}</Descriptions.Item>
        <Descriptions.Item label="共享类型">{getOrderType(order_type)}</Descriptions.Item>
        <Descriptions.Item label="所属机构">{orderDetail.provider_name}</Descriptions.Item>
        <Descriptions.Item label="机构节点">{orderDetail.provider_node}</Descriptions.Item>
        {orderDetail.data_type === 3 ? (
          <>
            <Descriptions.Item label="使用限制">
              {PRIVATE_TYPE_LIST[orderDetail.is_private || 'false']}
            </Descriptions.Item>
            <Descriptions.Item label="是否审核">
              {orderDetail.need_approval ? '是' : '否'}
            </Descriptions.Item>
            {orderDetail.need_approval ? (
              <Descriptions.Item label="审核内容">
                {APPROVE_CONTENT[orderDetail.approve_content || 0]}
              </Descriptions.Item>
            ) : null}
          </>
        ) : null}
        <Descriptions.Item label="数据主题" span={2}>
          {(orderDetail.topics || []).map(item => (
            <span style={{ marginRight: 8 }}>{DATA_THEME[item].value}</span>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="数据描述" span={2}>
          {orderDetail.data_desc}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="交易信息" className="container-card" {...restProps}>
        <Descriptions.Item label="交易哈希">{orderDetail.tx_hash}</Descriptions.Item>
        <Descriptions.Item label="区块哈希">{orderDetail.blk_hash}</Descriptions.Item>
      </Descriptions>
      {od_status === STATUS_LIST.paid || od_status === STATUS_LIST.pending_pay ? (
        <div className={`container-card ${styles.txTotal}`}>
          <span className={styles.label}>交易总计</span>
          <span className={styles.count}>{toFixPrice(orderDetail.price)} Bx</span>
        </div>
      ) : null}
      {od_status === STATUS_LIST.pending_pay ? (
        <ButtonGroup
          left="取消订单"
          onClickL={handleReject}
          right="继续支付"
          onClickR={handlePass}
          style={{ marginTop: 40, textAlign: 'center' }}
        />
      ) : null}
      {od_status === STATUS_LIST.pending_approval && isProvider === 1 ? (
        <ButtonGroup
          left="审核驳回"
          onClickL={handleReject}
          right="审核通过"
          onClickR={handlePass}
          style={{ marginTop: 40, textAlign: 'center' }}
        />
      ) : null}
      <PassModal
        visible={isPassModal}
        handleCancel={() => setIsPassModal(false)}
        type={order_type}
        handlePass={handlePass}
      />
      <RejectModal
        visible={isRejectModal}
        handleCancel={() => setIsRejectModal(false)}
        type={order_type}
        handleReject={handleReject}
      />
    </>
  );
}

export default connect(({ datasharing }) => ({
  orderDetail: datasharing.orderDetail,
}))(OrderDetail);
