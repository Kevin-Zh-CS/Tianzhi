import React from 'react';
import { Modal, Form, Input, Radio } from 'antd';
import _ from 'lodash';

const EntityType = {
  FACT: 'FACT',
  DIM: 'DIM',
  OTHER: 'OTHER',
};

const EntityTypeDisplay = {
  FACT: '事实表',
  DIM: '维度表',
  OTHER: '其他表',
};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
/** 创建模型弹窗 */
const CreateEntityModal = props => {
  const { visible, onOk, onCancel } = props;
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [currentEntityType, setCurrentEntityType] = React.useState(EntityType.FACT);
  const [form] = Form.useForm();
  const hanldeOk = () => {
    form.validateFields().then(values => {
      const callback = result => {
        setConfirmLoading(false);
        if (result) {
          onCancel();
        }
      };
      setConfirmLoading(true);
      onOk(Object.assign(Object.assign({}, values), { cb: callback }));
    });
  };
  const onChange = e => {
    /** 切换模型类型重置表单 */
    form.resetFields();
    setCurrentEntityType(e.target.value);
  };
  return (
    <Modal
      title="创建模型"
      visible={visible}
      confirmLoading={confirmLoading}
      wrapClassName="create-entity-container"
      okText="确定"
      cancelText="取消"
      onOk={hanldeOk}
      onCancel={() => onCancel()}
      mask={false}
      centered
      destroyOnClose
    >
      <Form form={form}>
        <Form.Item
          {...formItemLayout}
          name="entityType"
          label="模型类型"
          rules={[{ required: true }]}
          initialValue={currentEntityType}
        >
          <Radio.Group onChange={onChange}>
            {_.map(EntityType, type => (
              <Radio value={type} key={type}>
                {EntityTypeDisplay[type]}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          name="displayName"
          label="中文名"
          rules={[
            { required: true, message: '请输入中文名称' },
            {
              validator: (rule, v, callback) => {
                const reg1 = new RegExp(`^[a-zA-Z0-9_]*$`);
                if (reg1.test(v)) {
                  callback('必须包含中文');
                }
                const reg2 = new RegExp('^[\\u4e00-\\u9fa5a-zA-Z0-9_]*$');
                if (reg2.test(v)) {
                  callback();
                } else {
                  callback('只能包含中文、字符、数字、下划线');
                }
              },
            },
          ]}
          initialValue="用户创建的表"
        >
          <Input placeholder="请输入中文名称" autoComplete="off" />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          name="name"
          label="英文名"
          rules={[
            { required: true, message: '请输入英文名' },
            {
              validator: (rule, v, callback) => {
                if (v.includes(' ')) {
                  callback('不能包含空格');
                }
                const reg = new RegExp(`^[a-zA-Z0-9_]*$`);
                if (reg.test(v)) {
                  callback();
                } else {
                  callback('只能包含数字、字符、下划线');
                }
              },
            },
          ]}
          initialValue="customNode"
        >
          <Input placeholder="请输入英文名" autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateEntityModal;
