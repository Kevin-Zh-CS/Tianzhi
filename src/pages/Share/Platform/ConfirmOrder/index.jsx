import React, { useEffect } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import Page from '@/components/Page';
import { Form, IconBase, Modal } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import OrderInfo from '../components/OrderInfo';
import qulianlogo from '@/assets/qulian_logo.png';
import juyiyanlogo from '@/assets/juyiyan_logo.png';
import loading from '@/assets/loading.png';
import styles from './index.less';
import { confirmDataSharingOrder, generateDataSharingOrder } from '@/services/datasharing';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import WithLoading from '@/components/WithLoading';

function ConfirmOrder(props) {
  const { location, dispatch, dataDetail = {} } = props;
  let { duration } = location.query;
  const { quantity, idx, price } = location.query;
  const [form] = Form.useForm();

  const handlePass = async () => {
    const values = await form.validateFields();
    Modal.info({
      title: dataDetail.order_type ? '确认提交该订单吗？' : '确认支付该订单吗？',
      content: '确认订单后，将使用您的私钥签名进行验证。',
      okText: '确定',
      icon: <IconBase icon={questionCircleIcon} fontSize={36} fill="#0076D9" />,
      onOk: async () => {
        const { applyReason, defineDuration, defineTime } = values;
        if (!duration) {
          duration = values.duration === '-1' ? defineDuration || 0 : values.duration || 0;
        }
        const val = await generateDataSharingOrder({
          data_id: dataDetail.data_id,
          duration,
          price,
        });
        const { order_id } = val;
        const params = { order_id, duration, quantity };
        if (applyReason) {
          params.reason = applyReason;
        }
        if (idx) {
          params.credit_package_idx = idx;
        }
        if (!quantity) {
          params.quantity = values.time === '-1' ? defineTime || 0 : values.time || 0;
        }
        await confirmDataSharingOrder(params);
        router.push(`/share/platform/traderesult?orderId=${order_id}`);
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };
  const handleReject = () => {
    router.push(`/share/platform/datadetail?dataId=${dataDetail.data_id}`);
  };
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'datasharing/dataDetail',
        payload: { dataId: location.query.dataId },
      });
    }
  }, []);
  return (
    <Page
      title="确认订单"
      onBack={() => router.push(`/share/platform/datadetail?dataId=${dataDetail.data_id}`)}
      noContentLayout
    >
      <div className={`${styles.confirmOrder} container-card`}>
        <div align="center" style={{ marginLeft: 200 }}>
          <div className={styles.orgTitle}>数据需求方</div>
          <img className={styles.orgLogo} alt="" src={qulianlogo} />
          <div className={styles.orgName}>{dataDetail.applier_name}</div>
        </div>
        <div className={styles.loading} align="center">
          <span>正在获取数据访问凭证</span>
          <img alt="" src={loading} width={370} height={8}></img>
        </div>
        <div align="center" style={{ marginRight: 200 }}>
          <div className={styles.orgTitle}>数据提供方</div>
          <img className={styles.orgLogo} alt="" src={juyiyanlogo} />
          <div className={styles.orgName}>{dataDetail.org_name}</div>
        </div>
      </div>
      <OrderInfo location={location} form={form} />

      <div>
        <ButtonGroup
          left="取消"
          onClickL={handleReject}
          right="确认订单"
          onClickR={handlePass}
          style={{ marginTop: 32, textAlign: 'center' }}
        />
      </div>
    </Page>
  );
}

export default connect(({ datasharing, loading: _loading }) => ({
  dataDetail: datasharing.dataDetail,
  loading: _loading.effects['datasharing/dataDetail'],
}))(WithLoading(ConfirmOrder));
