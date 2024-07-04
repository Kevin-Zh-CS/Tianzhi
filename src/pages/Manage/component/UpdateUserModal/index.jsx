import React, { useEffect } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Form, Input, Select, message } from 'quanta-design';
import { modifyMember } from '@/services/resource';

import HintText from '@/components/HintText';
import styles from './index.less';

function CreateModal(props) {
  const { visible, onOk, onCancel, updateUser = {}, namespace, type, roleList } = props;
  const { name, tel, role, address } = updateUser;

  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name,
        tel,
        role,
      });
    }
  }, [visible]);

  const _onCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  const _onOk = async () => {
    const formValues = await form.validateFields();
    if (formValues.role !== role) {
      await modifyMember({
        ns_id: namespace,
        address,
        role: formValues.role,
      });
      message.success('成员权限修改成功！');
      if (onOk) onOk();
    } else {
      _onCancel();
    }
  };

  const formItemLayout = {
    labelCol: { style: { width: 70, textAlign: 'right', marginRight: 20 } },
    wrapperCol: {},
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.createModal, 'modal-has-top-border')}
      title="修改权限范围"
      visible={visible}
      onOk={_onOk}
      onCancel={_onCancel}
      style={{ width: 518, margin: '0 auto', top: 240 }}
    >
      <HintText>
        <div>
          {type === 'task'
            ? '任务成员信息中，只能对成员的角色进行修改。'
            : '资源库成员信息中，只能对资源库成员的权限范围进行修改。'}
        </div>
      </HintText>
      <Form colon={false} hideRequiredMark form={form} style={{ padding: '24px 40px 0px' }}>
        <Form.Item name="name" label="用户姓名" {...formItemLayout}>
          <Input style={{ width: 280 }} disabled />
        </Form.Item>
        <Form.Item name="tel" label="手机号" {...formItemLayout}>
          <Input style={{ width: 280 }} disabled />
        </Form.Item>
        <Form.Item name="role" label="角色名称" {...formItemLayout}>
          <Select style={{ width: 280 }} placeholder="请选择">
            {roleList
              .filter(li => li.id)
              .map(item => (
                <Select.Option value={item.id}>{item.display_name}</Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default connect()(CreateModal);
