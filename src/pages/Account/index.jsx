import React, { useState } from 'react';
import { connect } from 'dva';
import { Form, Modal, Descriptions, Divider, Icons, Input, Tooltip, message } from 'quanta-design';
import CopyToClipboard from 'react-copy-to-clipboard';
import PasswordModal from '@/components/PasswordModal';
import UploadAvatar from './UploadAvatar';
import Page from '@/components/Page';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';
import { updateTel } from '@/services/account';

const { EditIcon } = Icons;
const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
function Account({ dispatch = null, userInfo = {}, orgInfo = {}, style }) {
  const { name: userName, tel, addr: address } = userInfo;
  const { name: orgName, peer_info = {} } = orgInfo;
  const { registerTime: time = '' } = peer_info;
  const [nameVisible, setNameVisible] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [telVisible, setTelVisible] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState(false);
  const [form] = Form.useForm();

  const handleUserName = async () => {
    const formValues = await form.validateFields();
    dispatch({
      type: 'account/updateName',
      payload: { username: formValues.userName },
      callback: () => {
        dispatch({ type: 'account/info' });
        setNameVisible(false);
      },
    });
  };

  const handleDownload = () => {
    const fileName = '私钥.txt';
    if (dispatch) {
      dispatch({
        type: 'account/key',
        callback: blob => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          link.remove();
        },
      });
    }
  };

  const handleTel = async () => {
    const formValues = await form.validateFields();
    setTelVisible(false);
    Modal.info({
      title: '确认修改手机号吗？',
      content: '确认后，新手机号将立即生效，旧手机号将失效。',
      style: { top: 240 },
      onOk: async () => {
        // 调用接口
        await updateTel(formValues.tel);
        dispatch({ type: 'account/info' });
        message.success('手机号修改成功！');
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  return (
    <Page title="个人中心" showBackIcon noContentLayout className={styles.account}>
      <div className={`container-card ${styles.accountCard}`} style={style}>
        <Descriptions title="基本信息" labelStyle={{ width: 76 }}>
          <div className={styles.name}>{userName}</div>
          <Descriptions.Item label="所属机构">{orgName}</Descriptions.Item>
          <Descriptions.Item label="开通时间">{time}</Descriptions.Item>
        </Descriptions>
        {/* 上传头像功能还未实现，先隐藏，display: 'none' */}
        <UploadAvatar
          title="编辑头像"
          desc="头像"
          className={styles.upload}
          style={{ display: 'none' }}
        />
        <Divider dashed />
        <Descriptions labelStyle={{ width: 76 }}>
          <Descriptions.Item contentStyle={contentStyle} label="用户名">
            {userName}
            <span>
              <EditIcon className="hover-style" onClick={() => setNameVisible(true)} />
            </span>
          </Descriptions.Item>
          <Descriptions.Item contentStyle={contentStyle} label="手机号">
            {tel}
            <span>
              <EditIcon className="hover-style" onClick={() => setTelVisible(true)} />
            </span>
          </Descriptions.Item>
          <Descriptions.Item contentStyle={contentStyle} label="密码">
            ********
            <EditIcon className="hover-style" onClick={() => setPwdVisible(true)} />
          </Descriptions.Item>
          <Descriptions.Item contentStyle={contentStyle} label="地址">
            {address}
            <Tooltip title="复制成功" color="#08CB94" visible={copyTooltip}>
              <CopyToClipboard
                onCopy={() => {
                  setCopyTooltip(true);
                  setTimeout(() => {
                    setCopyTooltip(false);
                  }, 1000);
                }}
                text={address}
              >
                <a style={{ marginLeft: 8 }}>复制</a>
              </CopyToClipboard>
            </Tooltip>
          </Descriptions.Item>
        </Descriptions>
        <div className={styles.private}>
          <a onClick={handleDownload}>下载私钥</a>
        </div>
      </div>
      <PasswordModal visible={pwdVisible} onCancel={() => setPwdVisible(false)} closable />
      <Modal
        title="修改用户名"
        visible={nameVisible}
        onCancel={() => setNameVisible(false)}
        onOk={handleUserName}
        okText="确定"
      >
        <Form
          form={form}
          hideRequiredMark
          style={{ margin: '0 60px -32px' }}
          initialValues={{ userName }}
        >
          <Form.Item
            name="userName"
            label="用户名"
            rules={[
              { required: true, message: '用户名不能为空' },
              { max: 30, message: '用户名不可超过30个字符，请重新输入' },
              {
                pattern: /^[\u4e00-\u9fa5A-Za-z0-9]+$/,
                message: '用户名不能包含特殊字符，请重新输入',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改手机号"
        visible={telVisible}
        onCancel={() => setTelVisible(false)}
        onOk={handleTel}
        okText="确定"
      >
        <Form
          form={form}
          hideRequiredMark
          style={{ margin: '0 60px -32px' }}
          initialValues={{ tel }}
        >
          <Form.Item
            name="tel"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^[1][0-9]{10}$/, message: '手机号格式不正确，请重新输入' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
    </Page>
  );
}

export default connect(({ account, organization, loading }) => ({
  userInfo: account.info,
  orgInfo: organization.info,
  loading: loading.effects['account/info'],
}))(
  WithLoading(Account, {
    skeletonNum: 1,
    skeletonProps: { 1: { paragraph: { rows: 16 } } },
    skeletonStyle: { width: '58%', margin: 'auto' },
  }),
);
