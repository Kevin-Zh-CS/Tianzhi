import React, { useState } from 'react';
import { connect } from 'dva';
import { Input, Form, Modal } from 'quanta-design';
import HintText from '@/components/HintText';
import { register } from '@/services/account';
import UploadResultModal from './UploadResultModal';

function CreateModal({ visible = false, onCancel = null, handlRefresh = null }) {
  const [loaded, setLoaded] = useState(false);
  const [form] = Form.useForm();
  const handleCreate = async () => {
    const formValues = await form.validateFields();
    await register({
      name: formValues.name,
      tel: formValues.tel,
    });
    onCancel();
    setLoaded(true);
  };
  const handleCancel = () => {
    handlRefresh();
    setLoaded(false);
  };

  return (
    <>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="新建用户"
        visible={visible}
        onCancel={onCancel}
        okText="确定"
        onOk={handleCreate}
      >
        <HintText style={{ marginBottom: 24 }}>后台直接为用户新建账号后进行分配。</HintText>
        <Form form={form} preserve={false} hideRequiredMark style={{ margin: '0 60px -22px' }}>
          <Form.Item
            name="name"
            label="用户名"
            rules={[
              { required: true, message: '用户名不能为空' },
              { max: 30, message: '用户名不可超过30个字符，请重新输入' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="tel"
            label="手机号"
            validateFirst
            validateTrigger="onBlur"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^[1][0-9]{10}$/, message: '手机号格式不正确，请重新输入' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
      <UploadResultModal visible={loaded} onCancel={handleCancel} />
    </>
  );
}

export default connect()(CreateModal);
