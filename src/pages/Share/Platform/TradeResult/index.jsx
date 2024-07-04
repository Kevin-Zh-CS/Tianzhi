import React, { useEffect } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import Page from '@/components/NewPage';
import { Button, IconBase } from 'quanta-design';
import traderesultBg from '@/assets/traderesult_bg.png';
import { Typography } from 'antd';
import styles from './index.less';
import { getFileIcon } from '@/utils/icons';
import { ReactComponent as fileIcon } from '@/icons/file.svg';
import { getInfoDescList } from '@/pages/Share/Platform/config';
import OrderStatus from '@/pages/Share/components/OrderStatus';
import WithLoading from '@/components/WithLoading';

const { Paragraph } = Typography;
function TradeResult(props) {
  const { location, orderDetail = {}, dispatch } = props;
  const {
    query: { orderId },
  } = location;
  useEffect(() => {
    dispatch({
      type: 'datasharing/orderDetail',
      payload: {
        orderId,
      },
    });
  }, []);

  return (
    <Page
      title="交易结果"
      onBack={() => router.push(`/share/platform/datadetail?dataId=${orderDetail.data_id}`)}
      noContentLayout
    >
      <div>
        <OrderStatus isProvider={0} needKey />
        <div className={`${styles.tradeResult} container-card`}>
          <div className={styles.info}>
            <div className={styles.infoTitle}>{orderDetail.apply_name}的用户：</div>
            <div className={styles.infoDesc}>{getInfoDescList(orderDetail)}</div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.card1}`}>
              <div>
                <IconBase
                  icon={orderDetail.data_type ? getFileIcon(orderDetail.data_type) : fileIcon}
                  width={40}
                  height={40}
                  style={{ verticalAlign: 'middle' }}
                />
                <div className={styles.cardTitle}>
                  <Paragraph ellipsis={{ rows: 1, expandable: false }}>
                    {orderDetail.data_name}
                  </Paragraph>
                </div>
                <div className={styles.desc}>
                  <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                    {orderDetail.data_desc}
                  </Paragraph>
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => {
                  router.push(`/share/obtain/detail?orderId=${orderId}&isProvider=${0}`);
                }}
                style={{ marginLeft: 'auto' }}
              >
                查看订单详情
              </Button>
            </div>
            <div className={styles.card2}>
              <img alt="" className={styles.bg} src={traderesultBg}></img>
              <div className={styles.btn}>
                <Button
                  onClick={() => {
                    router.push('/share/platform');
                  }}
                >
                  继续查找数据
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default connect(({ datasharing, loading }) => ({
  dataDetail: datasharing.dataDetail,
  orderDetail: datasharing.orderDetail,
  loading: loading.global,
}))(WithLoading(TradeResult));
