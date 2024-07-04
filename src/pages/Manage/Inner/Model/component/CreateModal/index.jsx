import React from 'react';
import classnames from 'classnames';
import { Modal, Form, Input, message } from 'quanta-design';
import router from 'umi/router';
import HintText from '@/components/HintText';
import { createModel } from '@/services/resource-model';
import styles from './index.less';

function CreateModal(props) {
  const { visible, onCancel, namespace } = props;
  const formItemLayout = {
    labelCol: { style: { width: 76, textAlign: 'left' } },
    wrapperCol: {},
  };
  const [form] = Form.useForm();

  const cancel = () => {
    form.resetFields();
    onCancel();
  };

  const onOk = async () => {
    const { dataName } = await form.validateFields();
    const data = await createModel(namespace, { name: `${dataName}.lua` });
    cancel();
    message.success('模型新建成功！');
    router.push(`/manage/inner/repository/model/editor?id=${data.id}&namespace=${namespace}`);
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.createModal, 'modal-has-top-border')}
      title="新建模型"
      visible={visible}
      onOk={onOk}
      onCancel={cancel}
      style={{ width: 560, margin: '0 auto', top: 240 }}
    >
      <HintText>
        <div>新建模型后，需要进行模型内容编辑。</div>
      </HintText>
      <Form colon={false} hideRequiredMark form={form} style={{ padding: '24px 49px 0px' }}>
        <Form.Item
          name="dataName"
          label="模型名称"
          rules={[
            { required: true, message: '请输入模型名称' },
            { max: 30, message: '模型名称不可超过30个字符，请重新输入' },
          ]}
          {...formItemLayout}
        >
          <Input style={{ width: 280 }} placeholder="请输入模型名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateModal;
