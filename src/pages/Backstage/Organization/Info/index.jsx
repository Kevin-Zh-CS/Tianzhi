import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import {
  Button,
  Descriptions,
  Divider,
  Dropdown,
  IconBase,
  Menu,
  Modal,
  Form,
  Input,
  Tag,
} from 'quanta-design';
import Page from '@/components/Page';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as RightIcon } from '@/icons/circle_right.svg';
import { ReactComponent as StopIcon } from '@/icons/stop.svg';
import nodePng from '@/assets/blacklist/node.png';
import { message } from 'antd';
import { getNode, startNode, stopNode, updateNode, updateOrg } from '@/services/organization';

const { Item } = Form;
function Info({ dispatch = null, orgInfo = {}, userInfo = {}, menus = [] }) {
  const { name = '', org_id = '', desc = '', company_info = {} } = orgInfo;
  const { licenseExpireTime: expireTime = '' } = company_info;
  const [visible, setVisible] = useState(false);
  const [nodeVisible, setNodeVisible] = useState(false);
  const [nodeInfo, setNodeInfo] = useState({});
  const qflList = menus.filter(item => item.module_id === 3);
  const NODE_STATE_TAG = [
    <Tag
      style={{ marginLeft: 10, borderColor: '#D0D0D0' }}
      icon={<IconBase icon={StopIcon} fill="#888" />}
      color="default"
      bordered
    >
      离线
    </Tag>,
    <Tag
      style={{ marginLeft: 10 }}
      icon={<IconBase icon={RightIcon} fill="#08CB94" />}
      color="success"
      bordered
    >
      在线
    </Tag>,
  ];

  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { style: { width: 80, textAlign: 'left', marginLeft: 20 } },
    wrapperCol: { span: 16 },
  };

  const getNodeInfo = async () => {
    const info = await getNode();
    setNodeInfo(info);
  };

  useEffect(() => {
    if (dispatch) {
      dispatch({ type: 'organization/info' });
      dispatch({ type: 'account/info' });
    }
  }, []);

  useEffect(() => {
    if (qflList.length) {
      getNodeInfo();
    }
  }, [menus]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await updateOrg({ org_id, ...values });
    message.success('机构信息修改成功！');
    dispatch({ type: 'organization/info' });
    setVisible(false);
  };

  const handleVisible = () => {
    form.setFieldsValue({
      org_name: name,
      org_desc: desc,
    });
    setVisible(true);
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={handleVisible}>修改基本信息</Menu.Item>
    </Menu>
  );

  const handleModify = () => {
    form.setFieldsValue({
      ...nodeInfo,
    });
    setNodeVisible(true);
  };

  const handleStart = () => {
    Modal.info({
      title: '确认启用当前节点吗？',
      content: '启用后，节点将正常提供服务和参与计算任务。',
      style: { top: 240 },
      onOk: async () => {
        // 调用接口
        await startNode();
        message.success('节点启用成功！');
        Modal.destroyAll();
        await getNodeInfo();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleStop = () => {
    Modal.info({
      title: '确认停用当前节点吗？',
      content: '停用后，该节点将无法提供服务和参与计算任务。',
      style: { top: 240 },
      onOk: async () => {
        // 调用接口
        await stopNode();
        message.success('节点停用成功！');
        Modal.destroyAll();
        await getNodeInfo();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
    });
  };

  const handleAddData = async () => {
    const values = await form.validateFields();
    await updateNode(values);
    message.success('节点信息修改成功！');
    setNodeVisible(false);
    await getNodeInfo();
  };

  return (
    <Page title="机构信息" className={styles.orgInfo}>
      <Descriptions title="基本信息" labelStyle={{ width: 76 }}>
        <div className={styles.name}>{name}</div>
        <Descriptions.Item label="到期时间">{expireTime}</Descriptions.Item>
      </Descriptions>
      <div style={{ width: '80%' }}>
        <Divider dashed />
      </div>
      <Descriptions labelStyle={{ width: 76 }} style={{ width: '65%' }}>
        <Descriptions.Item label="机构名称" style={{ paddingBottom: userInfo.is_admin ? 4 : 12 }}>
          <div className={styles.itemWrap}>
            <span>{name}</span>
            {userInfo.is_admin ? (
              <Dropdown
                overlay={menu}
                overlayStyle={{ minWidth: 120 }}
                placement="bottomLeft"
                overlayClassName={styles.resourceInfoDropdown}
              >
                <i className="iconfont icontongyongxing_gengduo_shuipingx" />
              </Dropdown>
            ) : null}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="机构 ID">{org_id}</Descriptions.Item>
        <Descriptions.Item label="机构描述">{desc}</Descriptions.Item>
      </Descriptions>
      {qflList.length ? (
        <>
          <div style={{ width: '80%' }}>
            <Divider dashed />
          </div>
          <Descriptions title="节点信息" style={{ width: '65%' }}>
            <Descriptions.Item className={styles.node}>
              <div className={styles.nodeContainer}>
                <div className={styles.nodeContainerInfo}>
                  <img src={nodePng} alt="" />
                  <div>
                    <div>
                      <span className={styles.title}>{nodeInfo.name}</span>
                      <span>{nodeInfo.isAvailable ? NODE_STATE_TAG[1] : NODE_STATE_TAG[0]}</span>
                    </div>
                    <div className={styles.nodeDetail}>
                      <div className={styles.nodeDetailItem}>
                        <span className="quanta-descriptions-item-label quanta-descriptions-item-no-colon">
                          节点IP
                        </span>
                        <span className="quanta-descriptions-item-content">{nodeInfo.ip}</span>
                      </div>
                      <div className={styles.nodeDetailItem}>
                        <span className="quanta-descriptions-item-label quanta-descriptions-item-no-colon">
                          节点端口
                        </span>
                        <span className="quanta-descriptions-item-content">{nodeInfo.port}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Dropdown
                  overlay={
                    <Menu style={{ width: 120 }}>
                      <Menu.Item onClick={handleModify}>修改节点信息</Menu.Item>
                      <Menu.Item disabled={!nodeInfo.isAvailable} onClick={handleStop}>
                        停用节点
                      </Menu.Item>
                      <Menu.Item disabled={nodeInfo.isAvailable} onClick={handleStart}>
                        启用节点
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button onClick={() => {}} icon={<IconBase icon={MoreIcon} />} />
                </Dropdown>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="修改基本信息"
        visible={visible}
        onOk={handleOk}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Form form={form} hideRequiredMark>
          <Form.Item
            name="org_name"
            label="机构名称"
            rules={[
              { required: true, message: '请输入机构名称' },
              { max: 30, message: '请输入30字以内机构名称' },
            ]}
            {...formItemLayout}
          >
            <Input placeholder="请输入机构名称" />
          </Form.Item>
          <Form.Item
            name="org_desc"
            label="机构描述"
            {...formItemLayout}
            rules={[
              { required: true, message: '请输入机构描述' },
              { max: 100, message: '请输入100字以内机构描述' },
            ]}
          >
            <Input.TextArea rows={4} placeholder="请输入100字以内机构描述" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        maskClosable={false}
        keyboard={false}
        destroyOnClose
        title="修改节点信息"
        okText="确定"
        visible={nodeVisible}
        onOk={handleAddData}
        wrapClassName={styles.infoModal}
        onCancel={() => {
          setNodeVisible(false);
        }}
      >
        <div className={styles.infoText}>节点信息中，只能对节点名称进行修改。</div>
        <Form form={form} {...formItemLayout}>
          <Item label="节点名称" name="name">
            <Input />
          </Item>
          <Item label="节点IP" name="ip">
            <Input disabled />
          </Item>
          <Item label="节点端口" name="port">
            <Input disabled />
          </Item>
        </Form>
      </Modal>
    </Page>
  );
}

export default connect(({ organization, account }) => ({
  userInfo: account.info,
  menus: account.menus,
  orgInfo: organization.info,
}))(WithLoading(Info, { skeletonNum: 1, skeletonProps: { 1: { paragraph: { rows: 8 } } } }));
