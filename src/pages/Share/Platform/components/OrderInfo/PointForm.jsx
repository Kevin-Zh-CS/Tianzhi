import React from 'react';
import { connect } from 'dva';
import { ORDER_TYPE } from '@/utils/enums';
import { Descriptions, Alert } from 'quanta-design';
import styles from './index.less';
import { toFixPrice, getValidDuration, getValidQuantity } from '@/utils/helper';
import Info from './info';

function PointForm(props) {
  const { dataDetail = {}, location, status } = props;
  const { query } = location;
  return (
    <div className={styles.orderInfo}>
      <div className={styles.note}>
        <Alert
          type="info"
          showIcon
          message={
            dataDetail.order_type === ORDER_TYPE.publish
              ? '温馨提示：该数据为公开数据，可以直接获取该数据'
              : '温馨提示：该数据需用积分购买，购买成功后才能使用。'
          }
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
          <Descriptions.items label="有效时间">
            {dataDetail.order_type === ORDER_TYPE.credit
              ? getValidDuration(Number(query.duration))
              : '永久'}
          </Descriptions.items>
          <Descriptions.items label="有效次数">
            {dataDetail.order_type === ORDER_TYPE.credit
              ? getValidQuantity(Number(query.quantity))
              : '不限'}
          </Descriptions.items>
          {dataDetail.order_type === ORDER_TYPE.credit ? (
            <Descriptions.items label="积分价格">{toFixPrice(query.price)} Bx</Descriptions.items>
          ) : null}
        </Descriptions>
      </div>
      {status ? null : (
        <div className={`container-card ${styles.txTotal}`}>
          <span className={styles.label}>交易总计</span>
          <span className={styles.count}>{toFixPrice(query.price)} Bx</span>
        </div>
      )}
    </div>
  );
}

export default connect(({ datasharing }) => ({
  dataDetail: datasharing.dataDetail,
}))(PointForm);
