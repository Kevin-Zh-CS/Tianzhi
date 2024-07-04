import React, { useRef } from 'react';
import { Modal, Input, Select, Form } from 'quanta-design';
import HintText from '@/components/HintText';
// import styles from './index.less';

function AddMemberModal(props) {
  const { visible, onCancel, onOk } = props;
  const formRef = useRef(null);
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'right', marginLeft: 12 } },
    wrapperCol: {},
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="新建自定义角色"
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
    >
      <HintText style={{ marginBottom: 24 }}>
        为不同类型资源创建角色，方便分配资源使用权限。
      </HintText>
      <Form colon={false} hideRequiredMark ref={formRef}>
        <Form.Item name="dataName" label="资源类型" {...formItemLayout}>
          <Input style={{ width: 280 }} disabled defaultValue="隐私计算任务" />
        </Form.Item>
        <Form.Item name="dataName2" label="角色名称" {...formItemLayout}>
          <Input style={{ width: 280 }} placeholder="请输入角色名称" />
        </Form.Item>
        <Form.Item name="user" label="权限配置" {...formItemLayout}>
          <Select style={{ width: 280 }} placeholder="请选择权限配置">
            <Select.Option key="1">1</Select.Option>
            <Select.Option key="2">2</Select.Option>
            <Select.Option key="3">3</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddMemberModal;
