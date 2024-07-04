import React from 'react';
import { connect } from 'dva';
import { Modal, Alert, Input, message, Form } from 'quanta-design';
import styles from './index.less';
import { approvalDataSharingOrder } from '@/services/datasharing';

function RejectModal(props) {
  const { visible, handleCancel, handleReject, type, orderDetail = {} } = props;
  const { order_id } = orderDetail;
  const [form] = Form.useForm();
  const handleOk = async () => {
    const values = await form.validateFields();
    const params = {
      order_id,
      duration: -1,
      quantity: -1,
      pass: 0,
      reason: values.reason,
    };
    await approvalDataSharingOrder(params);
    message.success('审核拒绝成功！');
    window.location.reload();
    handleReject();
  };
  return !type ? (
    <div></div>
  ) : (
    <div>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="审核驳回"
        visible={visible}
        onOk={handleOk}
        okText="确定"
        onCancel={handleCancel}
        className={styles.modal}
      >
        <Alert
          type="info"
          message={
            <span>
              温馨提示：审核驳回之前需要填写驳回理由。
              <br />
              提交后，将使用您的私钥签名进行验证。
            </span>
          }
          showIcon
        />
        <div className={styles.content}>
          <Form form={form}>
            <Form.Item
              label="驳回理由"
              name="reason"
              rules={[
                { required: true, message: '驳回理由不能为空' },
                { max: 100, message: '驳回理由不可超过100个字符，请重新输入' },
              ]}
            >
              <Input.TextArea
                placeholder="请输入100字以内的驳回理由"
                className={styles.textarea}
                rows={3}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default connect(({ datasharing }) => ({
  orderDetail: datasharing.orderDetail,
  approvalOrder: datasharing.approvalOrder,
}))(RejectModal);
