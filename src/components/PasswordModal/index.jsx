import React, { useState } from 'react';
import { Modal, Alert, Form, Input, Icons, Tooltip, Button, Popover } from 'quanta-design';
import { connect } from 'dva';
import styles from './index.less';
import { updatePwd } from '@/services/account';

const { QuestionCircleIcon, CheckCircleIcon, CloseCircleIcon } = Icons;
const CheckIcon = {
  true: <CheckCircleIcon fill="#08CB94" fontSize={16} style={{ marginRight: 2 }} />,
  false: <CloseCircleIcon fill="#E63B43" fontSize={16} style={{ marginRight: 2 }} />,
};

function PasswordModal(props) {
  const { visible = false, title = '修改密码', onCancel = null, closable = false } = props;
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 90, textAlign: 'left' } },
    wrapperCol: {},
  };
  const [loading, setLoading] = useState(false);
  const [checkLen, setCheckLen] = useState(false);
  const [checkType, setCheckType] = useState(false);
  const [checkVisible, setCheckVisible] = useState(false);
  const onChange = e => {
    setCheckVisible(true);
    const val = e.target.value;
    setCheckLen(val.length >= 6);
    const regex = /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*]+$)[a-zA-Z\d!@#$%^&*]+$/;
    setCheckType(regex.test(val));
  };
  const handleBlur = name => {
    const value = form.getFieldValue([name]);
    form.setFields([
      {
        name,
        value,
        errors: '',
      },
    ]);
  };
  const onOk = async () => {
    const formValues = await form.validateFields();
    setLoading(true);
    try {
      await updatePwd({
        oldPwd: formValues.pwd,
        newPwd: formValues.newPwd1,
      });
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      closable={closable}
      title={title}
      visible={visible}
      footer={
        <>
          {closable ? (
            <Button onClick={onCancel} type="link">
              取消
            </Button>
          ) : (
            <Tooltip title="修改初始密码后，才能使用系统完整功能">
              <Button disabled>取消</Button>
            </Tooltip>
          )}
          <Button loading={loading} onClick={onOk} type="primary" style={{ marginLeft: 8 }}>
            确定
          </Button>
        </>
      }
      onCancel={onCancel}
    >
      {closable ? null : (
        <Alert type="info" showIcon message="温馨提示：首次登录，请先修改初始密码。" />
      )}
      <Form form={form} hideRequiredMark style={{ margin: '20px 50px -30px' }}>
        <Form.Item
          name="pwd"
          label="原密码"
          validateTrigger="onBlur"
          validateFirst
          rules={[{ required: true, message: '请输入原密码' }]}
          {...formItemLayout}
        >
          <Input.Password onFocus={() => handleBlur('pwd')} placeholder="请输入原密码" />
        </Form.Item>

        <Popover
          visible={checkVisible}
          placement="rightTop"
          content={
            <>
              <div className={styles.popover}>{CheckIcon[checkLen]}6个字符</div>
              <div className={styles.popover}>
                {CheckIcon[checkType]}至少包含数字、字母和符号中的两种
              </div>
            </>
          }
        >
          <Form.Item
            name="newPwd1"
            label={
              <>
                新密码
                <Tooltip
                  title={
                    <span>
                      密码至少6个字符，支持数字、字母
                      <br />
                      和符号，至少包含其中两种。
                    </span>
                  }
                >
                  <QuestionCircleIcon style={{ marginLeft: 8 }} />
                </Tooltip>
              </>
            }
            validateTrigger="onBlur"
            validateFirst
            rules={[
              { required: true, message: '请设置密码' },
              { min: 6, message: '密码至少6位，支持数字、字母和符号' },
              {
                pattern: /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*]+$)[a-zA-Z\d!@#$%^&*]+$/,
                message: '密码至少6位，支持数字、字母和符号',
              },
            ]}
            {...formItemLayout}
          >
            <Input.Password
              onFocus={() => handleBlur('newPwd1')}
              onChange={onChange}
              onBlur={() => setCheckVisible(false)}
              placeholder="请输入新密码"
            />
          </Form.Item>
        </Popover>
        <Form.Item
          name="newPwd2"
          label="确认新密码"
          dependencies={['newPwd1']}
          validateTrigger="onBlur"
          validateFirst
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPwd1') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次输入的密码不一致，请重新输入');
              },
            }),
          ]}
          {...formItemLayout}
        >
          <Input.Password onFocus={() => handleBlur('newPwd2')} placeholder="请确认新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default connect(({ account }) => ({
  userInfo: account.info,
}))(PasswordModal);
