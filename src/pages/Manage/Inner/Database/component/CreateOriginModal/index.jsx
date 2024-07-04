import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Modal, Form, Input, message } from 'quanta-design';
import { createDatasource } from '@/services/datasource';
import HintText from '@/components/HintText';
import styles from './index.less';

// const { QuestionCircleIcon } = Icons;
@connect()
class CreateOriginModal extends React.Component {
  static defaultProps = {
    reload: () => {},
  };

  constructor() {
    super();
    this.formRef = React.createRef();
  }

  onOk = async () => {
    const { dataName } = await this.formRef.current.validateFields();
    const { onOk, colNames, namespace, dbHash, dbName, dbType, tableName } = this.props;
    const dbFields = [];
    for (let i = 0; i < colNames.length; i += 1) {
      dbFields.push({ name: colNames[i], desc: '', example: '', type: '' });
    }
    try {
      await createDatasource({
        namespace,
        dbFields,
        dbHash,
        dbName,
        dbType,
        tableName,
        title: dataName,
      });
      message.success('数据源生成成功！');
      onOk();
    } catch (e) {
      message.error('数据源生成失败！');
    }
  };

  onCancel = () => {
    const { onCancel } = this.props;
    const { current } = this.formRef;
    if (current) current.resetFields();
    if (onCancel) onCancel();
  };

  render() {
    const { visible } = this.props;
    const formItemLayout = {
      labelCol: { style: { width: 76, textAlign: 'left' } },
      wrapperCol: {},
    };
    return (
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        className={classnames(styles.createOriginModal, 'modal-has-top-border')}
        title="生成数据源"
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
        style={{ width: 560, margin: '0 auto', top: 240 }}
      >
        <HintText>
          <div>新建数据源后，需要进行数据源内容编辑。</div>
        </HintText>
        <Form
          colon={false}
          hideRequiredMark
          ref={this.formRef}
          style={{ padding: '24px 49px 0px' }}
        >
          <Form.Item
            name="dataName"
            label="数据源名称"
            rules={[
              { required: true, message: '请输入数据名称' },
              { max: 30, message: '数据源名称不可超过30个字符，请重新输入' },
            ]}
            {...formItemLayout}
          >
            <Input style={{ width: 280 }} placeholder="请输入数据源名称" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect(({ datasource }) => ({
  datasource: datasource.datasourceDetail,
}))(CreateOriginModal);
