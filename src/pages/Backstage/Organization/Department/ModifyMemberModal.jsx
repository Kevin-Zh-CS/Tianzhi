import React, { useRef, useState } from 'react';
import { Modal, Input, Form, Select } from 'quanta-design';
import HintText from '@/components/HintText';
import { DEPARTMENT_TYPE_TEXT } from '@/utils/enums';

function ModifyMemberModal(props) {
  const { title = '', desc = '', visible, onCancel, onOk, name, tel, role } = props;
  const formRef = useRef(null);
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'right', marginLeft: 12 } },
    wrapperCol: {},
  };
  const [value, setValue] = useState('');
  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title={title}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onOk(value)}
    >
      <HintText>{desc}</HintText>
      <Form colon={false} hideRequiredMark ref={formRef} style={{ marginTop: 24 }}>
        <Form.Item name="用户姓名" label="用户姓名" {...formItemLayout}>
          <Input style={{ width: 280 }} disabled defaultValue={name} />
        </Form.Item>
        <Form.Item name="手机号" label="手机号" {...formItemLayout}>
          <Input style={{ width: 280 }} disabled defaultValue={tel} />
        </Form.Item>
        <Form.Item name="成员角色" label="成员角色" {...formItemLayout}>
          <Select
            onChange={e => setValue(e)}
            defaultValue={DEPARTMENT_TYPE_TEXT[role]}
            style={{ width: 280 }}
          >
            <Select.Option key={0}>{DEPARTMENT_TYPE_TEXT[0]}</Select.Option>
            <Select.Option key={1}>{DEPARTMENT_TYPE_TEXT[1]}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModifyMemberModal;
