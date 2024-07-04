import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Tooltip } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { ORDER_SUCCESS_LIST, DATA_TYPE, getTopicsStr } from '@/pages/Manage/Outer/config';
import { getObtainDetail } from '@/services/outer-data';
import OrderSteps from '@/pages/Share/components/OrderSteps';
import OrderStatus from '@/pages/Share/components/OrderStatus';
import styles from './index.less';
import {
  getApplyCount,
  getApplyTimer,
  getValidCount,
  getValidTimer,
  toFixPrice,
} from '@/utils/helper';
import { connect } from 'dva';
import { getAuthData } from '@/pages/Manage/Inner/config';
import WithLoading from '@/components/WithLoading';
import { APPROVE_CONTENT, ORDER_TYPE, PRIVATE_TYPE_LIST, STATUS_LIST } from '@/utils/enums';

function ObtainDetail(props) {
  const { dispatch, orderDetail } = props;
  const { is_valid } = props.location.query;
  const [info, setInfo] = useState({});
  const index = info.data_duration
    ? info.data_duration.substr(0, info.data_duration.length - 1)
    : 0;

  const getInfo = async () => {
    const { id } = props.location.query;
    const data = await getObtainDetail(id);
    dispatch({
      type: 'datasharing/orderDetail',
      payload: {
        orderId: id,
      },
    });

    setInfo(data);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const gotoRequest = () => {
    router.push(
      `/manage/outer/obtain/request?id=${info.data_id}&type=${info.data_type}&order_id=${info.order_id}`,
    );
  };

  return (
    <div>
      <Page title="数据详情" showBackIcon noContentLayout>
        <div style={{ marginBottom: 12 }}>
          <OrderStatus isProvider={0} />
        </div>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <OrderSteps />
        </div>
        {orderDetail.order_type === ORDER_TYPE.auth &&
        (orderDetail.od_status === STATUS_LIST.pending_approval ||
          orderDetail.od_status === STATUS_LIST.pending_pay ||
          orderDetail.od_status === STATUS_LIST.pay_success ||
          orderDetail.od_status === STATUS_LIST.approval_reject ||
          orderDetail.od_status === STATUS_LIST.valid) ? (
          <div className={styles.detailWrap}>
            <Descriptions title="申请信息" column={2}>
              <Descriptions.Item label="有效时间">
                {getApplyTimer(orderDetail.order_type, orderDetail.apply_duration)}
              </Descriptions.Item>
              <Descriptions.Item label="有效次数">
                {getApplyCount(orderDetail.order_type, orderDetail.apply_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="申请理由" span={2}>
                {orderDetail.apply_reason || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : null}
        <div className={styles.detailWrap}>
          <Descriptions title="订单信息" column={2}>
            <Descriptions.Item label="订单编号">{info.order_id}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {is_valid === '0' ? ORDER_SUCCESS_LIST[info.order_status || 0].title : '已失效'}
            </Descriptions.Item>
            <Descriptions.Item label="有效时间">
              {orderDetail.od_status === STATUS_LIST.pending_approval ||
              orderDetail.od_status === STATUS_LIST.approval_reject
                ? '-'
                : getValidTimer(orderDetail.order_type, orderDetail)}
            </Descriptions.Item>
            <Descriptions.Item label="有效次数">
              {info.od_status === STATUS_LIST.pending_approval ||
              info.od_status === STATUS_LIST.approval_reject
                ? '-'
                : getValidCount(orderDetail.order_type, orderDetail)}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className={styles.detailWrap}>
          <Descriptions
            title="数据信息"
            extra={
              <div>
                <Tooltip title={is_valid === '0' ? '' : '该数据已失效，无权限请求！'}>
                  <Button type="primary" disabled={is_valid !== '0'} onClick={gotoRequest}>
                    请求数据
                  </Button>
                </Tooltip>
              </div>
            }
            column={2}
          >
            <Descriptions.Item label="数据标题">{info.data_title || '-'}</Descriptions.Item>
            <Descriptions.Item label="数据哈希">{orderDetail.data_hash || '-'}</Descriptions.Item>
            <Descriptions.Item label="数据类型">
              {DATA_TYPE[info.data_type || 0].value}
            </Descriptions.Item>
            <Descriptions.Item label="共享类型">{getAuthData(info.pub_type)}</Descriptions.Item>
            <Descriptions.Item label="所属机构">{info.owner_org_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="机构节点">{info.node_id || '-'}</Descriptions.Item>
            {info.data_type === 3 ? (
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
              {getTopicsStr(info.data_topics) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="数据描述" span={2}>
              {info.data_desc || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className={styles.detailWrap}>
          <Descriptions title="交易信息">
            <Descriptions.Item label="交易哈希">{info.tx_hash}</Descriptions.Item>
            <Descriptions.Item label="区块哈希">{info.block_hash}</Descriptions.Item>
          </Descriptions>
        </div>
        {info.data_price && JSON.stringify(info.data_price) !== '{}' ? (
          <div className={styles.detailWrap}>
            <div className={styles.priceWrap}>
              <span>交易总计</span>
              <span className={styles.total}>{`${toFixPrice(info.data_price[index])} Bx`}</span>
            </div>
          </div>
        ) : null}
      </Page>
    </div>
  );
}

export default connect(({ datasharing, loading, global }) => ({
  orderDetail: datasharing.orderDetail,
  loading: loading.global || global.loading,
}))(WithLoading(ObtainDetail, { skeletonNum: 5 }));
