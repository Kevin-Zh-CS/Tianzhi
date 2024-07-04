import React from 'react';
import { Form, Modal, Alert, Input } from 'quanta-design';

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
          isAgree: 0,
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
      title="拒绝邀请"
      visible={visible}
      onOk={submit}
      okText="确定"
      onCancel={onCancel}
    >
      <Alert
        type="info"
        message={
          <span>
            温馨提示：拒绝邀请之前需要填写拒绝理由。拒绝邀请后，将使用您的私钥签名进行验证。
          </span>
        }
        showIcon
      />
      <Form form={form} colon={false} hideRequiredMark style={{ padding: '24px 49px 0' }}>
        <Form.Item
          name="reason"
          label="拒绝理由"
          {...formItemLayout}
          rules={[
            { required: true, message: '请输入拒绝理由' },
            { max: 100, message: '拒绝理由不可超过100个字符，请重新输入' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="请输入100字以内拒绝理由" style={{ width: 280 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default RejectModal;
