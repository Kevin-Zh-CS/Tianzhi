import React from 'react';
import { connect } from 'dva';
import NotInWhiteList from './NotInWhiteList';
import PointForm from './PointForm';
import { ORDER_TYPE } from '@/utils/enums';
import styles from '@/pages/Share/Platform/components/OrderInfo/index.less';
import { Alert, Descriptions } from 'quanta-design';
import Info from '@/pages/Share/Platform/components/OrderInfo/info';

function OrderInfo(props) {
  const { dataDetail = {}, location, form } = props;
  // order_type 0: 积分共享 1:授权共享  2、公开数据

  if (dataDetail.order_type === ORDER_TYPE.credit) {
    return <PointForm location={location} />;
  }
  if (dataDetail.order_type === ORDER_TYPE.publish) {
    return <PointForm location={location} status={2} />;
  }

  if (dataDetail.in_white_list) {
    return (
      <div className={styles.orderInfo}>
        <div className={styles.note}>
          <Alert
            type="info"
            showIcon
            message="温馨提示：您所在的机构目前处于该数据的授权名单中，可以直接获取数据。"
          />
        </div>
        <Info />
        <div className={`${styles.dataInfo} container-card`}>
          <Descriptions
            column={3}
            title="套餐信息"
            className={styles.descriptionsPrice}
            labelStyle={{ width: 76 }}
          >
            <Descriptions.items label="有效时间">永久</Descriptions.items>
            <Descriptions.items label="有效次数">不限</Descriptions.items>
          </Descriptions>
        </div>
      </div>
    );
  }

  return <NotInWhiteList form={form} />;
}

export default connect(({ datasharing }) => ({
  dataDetail: datasharing.dataDetail,
}))(OrderInfo);
