import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Form, Input, Select } from 'quanta-design';

import HintText from '@/components/HintText';
import styles from './index.less';

// const { QuestionCircleIcon } = Icons;
@connect()
class CreateModal extends React.Component {
  static defaultProps = {
    reload: () => {},
  };

  constructor() {
    super();
    this.state = {};
    this.formRef = React.createRef();
  }

  onOk = () => {
    const { onOk } = this.props;
    if (onOk) onOk();
  };

  onCancel = () => {
    const { onCancel } = this.props;
    const { current } = this.formRef;
    if (current) current.resetFields();
    if (onCancel) onCancel();
  };

  onChange = e => {
    console.log(e.target.value);
  };

  render() {
    const { visible, isCreate = true } = this.props;
    const { confirmLoading } = this.state;
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
        title={isCreate ? '新建自定义角色' : '修改自定义角色'}
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
        confirmLoading={confirmLoading}
        style={{ width: 518, margin: '0 auto', top: 240 }}
      >
        <HintText>
          <div>为不同类型资源创建角色，方便分配资源使用权限。</div>
        </HintText>
        <Form
          colon={false}
          hideRequiredMark
          ref={this.formRef}
          style={{ padding: '24px 40px 0px' }}
        >
          <Form.Item name="dataName" label="资源类型" {...formItemLayout}>
            <Select style={{ width: 280 }} placeholder="请选择资源类型" onChange={this.setType}>
              <Select.Option value="1">文件夹</Select.Option>
              <Select.Option value="2">文件</Select.Option>
              <Select.Option value="3">模型</Select.Option>
              <Select.Option value="4">接口</Select.Option>
              <Select.Option value="5">数据库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="角色名称" {...formItemLayout}>
            <Input style={{ width: 280 }} placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="publicType" label="权限配置" {...formItemLayout}>
            <Select style={{ width: 280 }} placeholder="请选择权限配置" onChange={this.setType}>
              <Select.Option value="1">新建文件夹</Select.Option>
              <Select.Option value="2">上传文件</Select.Option>
              <Select.Option value="3">查看文件夹</Select.Option>
              <Select.Option value="4">下载文件夹</Select.Option>
              <Select.Option value="5">删除文件夹</Select.Option>
              <Select.Option value="6">添加成员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default CreateModal;
