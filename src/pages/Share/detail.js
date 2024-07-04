import React, { useEffect } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import Page from '@/components/Page';
import OrderStatus from './components/OrderStatus';
import OrderSteps from './components/OrderSteps';
import OrderDetail from './components/OrderDetail';
import WithLoading from '@/components/WithLoading';

function Detail(props) {
  const { location, dispatch } = props;
  const { query } = location;
  useEffect(() => {
    dispatch({
      type: 'datasharing/orderDetail',
      payload: {
        orderId: location.query.orderId,
      },
    });
  }, []);

  return (
    <Page title="订单详情" onBack={() => router.goBack()} noContentLayout>
      <div style={{ marginBottom: 12 }}>
        <OrderStatus isProvider={Number(query.isProvider)} />
      </div>
      <OrderSteps style={{ marginTop: 12 }} />
      <OrderDetail isProvider={Number(query.isProvider)} style={{ marginTop: 12 }} />
    </Page>
  );
}

export default connect()(WithLoading(Detail));
