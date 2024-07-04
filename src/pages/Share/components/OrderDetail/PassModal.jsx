import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Modal, Alert, Select, message, Input, Form } from 'quanta-design';
import { validatorPrices } from '@/pages/Manage/Inner/config';
import { approvalDataSharingOrder } from '@/services/datasharing';
import styles from './index.less';

function PassModal(props) {
  const { visible, handleCancel, handlePass, orderDetail = {} } = props;
  const [defineVisible, setDefineVisible] = useState(false);
  const [timeVisible, setTimeVisible] = useState(false);
  const [form] = Form.useForm();
  const handleOk = async () => {
    const values = await form.validateFields();
    const { order_id } = orderDetail;
    const { duration, defineDuration, quantity, defineQuantity } = values;
    const params = {
      order_id,
      duration: duration === '-2' ? defineDuration || 0 : duration === '-1' ? 0 : duration,
      quantity: quantity === '-2' ? defineQuantity || 0 : quantity === '-1' ? 0 : quantity,
      pass: 1,
      reason: '',
    };
    await approvalDataSharingOrder(params);
    message.success('审核通过成功！');
    window.location.reload();
    handlePass();
  };

  const initData = () => {
    form.setFieldsValue({
      duration: String(orderDetail.apply_duration),
      quantity: String(orderDetail.apply_amount),
    });
  };

  useEffect(() => {
    if (visible) {
      initData();
    }
  }, [visible]);
  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="审核通过"
      visible={visible}
      onOk={handleOk}
      okText="确定"
      onCancel={handleCancel}
      className={styles.modal}
    >
      <Alert
        type="info"
        message="温馨提示：审核通过之前设置数据授权有效时间和有效次数。 提交后，将使用您的私钥签名进行验证。"
        showIcon
      />
      <div className={styles.content}>
        <Form form={form} hideRequiredMark>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Form.Item
              label="有效时间"
              name="duration"
              rules={[{ required: true, message: '请选择有效时间' }]}
            >
              <Select
                className={styles.select}
                placeholder="请选择有效次数"
                onChange={e => {
                  setDefineVisible(false);
                  if (e === '-2') {
                    setDefineVisible(true);
                  }
                }}
              >
                {orderDetail.apply_duration > 0 ? (
                  <Select.Option key={orderDetail.apply_duration}>
                    {orderDetail.apply_duration}天
                  </Select.Option>
                ) : null}
                <Select.Option key={-1}>不限</Select.Option>
                <Select.Option key={-2}>自定义</Select.Option>
              </Select>
            </Form.Item>
            {defineVisible && (
              <Form.Item
                className={styles.input}
                name="defineDuration"
                rules={[
                  { required: true, message: '请输入有效时间' },
                  { validator: validatorPrices },
                ]}
              >
                <Input placeholder="请输入有效时间" suffix="天" />
              </Form.Item>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Form.Item
              label="有效次数"
              name="quantity"
              rules={[{ required: true, message: '请选择有效次数' }]}
            >
              <Select
                className={styles.select}
                placeholder="请选择有效次数"
                onChange={e => {
                  setTimeVisible(false);
                  if (e === '-2') {
                    setTimeVisible(true);
                  }
                }}
              >
                {orderDetail.apply_amount > 0 ? (
                  <Select.Option key={orderDetail.apply_amount}>
                    {orderDetail.apply_amount}次
                  </Select.Option>
                ) : null}
                <Select.Option key={-1}>不限</Select.Option>
                <Select.Option key={-2}>自定义</Select.Option>
              </Select>
            </Form.Item>
            {timeVisible && (
              <Form.Item
                className={styles.input}
                name="defineQuantity"
                rules={[
                  { required: true, message: '请输入有效次数' },
                  { validator: validatorPrices },
                ]}
              >
                <Input placeholder="请输入有效次数" suffix="次" />
              </Form.Item>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default connect(({ datasharing }) => ({
  orderDetail: datasharing.orderDetail,
  approvalOrder: datasharing.approvalOrder,
}))(PassModal);
