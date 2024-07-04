import React from 'react';
import { Form, Modal, Alert, Input } from 'quanta-design';
import styles from './index.less';

function RejectModal(props) {
  const { visible, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };

  const submit = () => {
    form
      .validateFields()
      .then(formValues => {
        onOk({
          isAgree: false,
          refuseReason: formValues.reason,
        });
        onCancel();
      })
      .catch(errorInfo => {
        console.log(errorInfo);
      });
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="审核驳回"
      visible={visible}
      onOk={submit}
      okText="确定"
      onCancel={onCancel}
      className={styles.modal}
    >
      <Alert
        type="info"
        message={
          <span>
            温馨提示：子模型驳回之前需要填写驳回理由。驳回后，将使用您的私钥签名进行验证。
          </span>
        }
        showIcon
      />
      <Form form={form} colon={false} hideRequiredMark style={{ padding: '24px 49px 0' }}>
        <Form.Item
          name="reason"
          label="驳回理由"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入驳回理由' },
            { max: 100, message: '驳回理由不可超过100个字符，请重新输入' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="请输入100字以内驳回理由" style={{ width: 280 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default RejectModal;
