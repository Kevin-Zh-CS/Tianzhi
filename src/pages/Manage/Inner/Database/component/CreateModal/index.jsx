import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Form, Input } from 'quanta-design';

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
    const { visible } = this.props;
    const { confirmLoading } = this.state;
    const formItemLayout = {
      labelCol: { style: { width: 76, textAlign: 'left' } },
      wrapperCol: {},
    };
    return (
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        className={classnames(styles.createModal, 'modal-has-top-border')}
        title="新建模型"
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
        confirmLoading={confirmLoading}
        style={{ width: 560, margin: '0 auto', top: 240 }}
      >
        <HintText>
          <div>新建模型后，需要进行模型内容编辑。</div>
        </HintText>
        <Form
          colon={false}
          hideRequiredMark
          ref={this.formRef}
          style={{ padding: '24px 49px 0px' }}
        >
          <Form.Item name="dataName" label="模型名称" {...formItemLayout}>
            <Input style={{ width: 280 }} placeholder="请输入模型名称" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default CreateModal;
