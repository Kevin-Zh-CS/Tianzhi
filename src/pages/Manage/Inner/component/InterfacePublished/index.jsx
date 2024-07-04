import React, { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, IconBase, Dropdown, Menu, message } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import Page from '@/components/Page';
import { interfaceInfo } from '@/services/interface';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { share } from '@/utils/helper';
import { PUBLISH_INIT_STATUS } from '@/pages/Manage/Inner/Model/config';
import CodeEditor from '@/components/CodeEditor';
import { Collapse } from 'antd';
import { setOffline } from '@/services/resource';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { CaretRightOutlined } from '@ant-design/icons';
import OfflineModal from '@/pages/Manage/Inner/component/OfflineModal';
import router from 'umi/router';
import { connect } from 'dva';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import AddUser from '@/pages/Manage/component/AddUser';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import DataChainItem from '@/pages/Manage/component/DataChainItem';
import { PERMISSION } from '@/utils/enums';

const { Panel } = Collapse;

function ModalDetail(props) {
  const { namespace, id, style, dispatch } = props;
  const [info, setInfo] = useState({});
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const getInfo = async () => {
    const data = await interfaceInfo(namespace, id, dispatch);
    setInfo(data);
    return data;
  };

  const handleOffline = async () => {
    await setOffline(info.id);
    setOfflineModalVisible(false);
    message.success('数据下架成功！');
    await getInfo();
  };

  const methods = info.args ? JSON.parse(info.args) : {};
  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setOfflineModalVisible(true)}>下架数据</a>
      </Menu.Item>
    </Menu>
  );

  const getActiveKey = data => {
    const method = data.args ? JSON.parse(data.args) : {};
    const activeKeys = [];
    if (method.headers && JSON.stringify(method.headers) !== '{}') {
      activeKeys.push('0');
    }
    if (method.body && JSON.stringify(method.body) !== '{}') {
      activeKeys.push('1');
    }
    if (method.queries && JSON.stringify(method.queries) !== '{}') {
      activeKeys.push('2');
    }
    setDefaultActiveKey(activeKeys);
  };

  const initData = async () => {
    const data = await getInfo();
    getActiveKey(data);
  };

  useEffect(() => {
    if (auth.includes(PERMISSION.query)) initData();
  }, [auth]);

  const goBack = () => {
    if (props.needGoback) {
      router.goBack();
    } else {
      router.replace(`/manage/inner/repository/interface?namespace=${namespace}`);
    }
  };

  const handlePanelChange = e => {
    setDefaultActiveKey(e);
  };

  return (
    <div>
      <Page
        title="发布详情"
        alert={
          auth.includes(PERMISSION.query) ? (
            <Alert
              type="info"
              message="温馨提示：数据发布时仅发布数据元信息（如数据标题、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
              showIcon
            />
          ) : null
        }
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <AddUser namespace={namespace} resourceId={id} auth={auth} />
            {info.chain_auth && info.status === PUBLISH_INIT_STATUS.publish ? (
              <Dropdown overlay={menu} placement="bottomRight">
                <div className={styles.dropdownTooltip}>
                  <IconBase style={{ verticalAlign: 'middle' }} icon={MoreIcon} />
                </div>
              </Dropdown>
            ) : null}
          </>
        }
        showBackIcon
        backFunction={goBack}
        noContentLayout
        className={styles.publishedPage}
      >
        {auth.includes(PERMISSION.query) ? (
          <div className={styles.contentWrap} style={style}>
            <ItemTitle title="数据元信息" />
            <DataItem
              info={{ ...info, type: 'interface', isPublish: true }}
              auth={auth}
              loadData={getInfo}
            />
            <Descriptions className={styles.infoContent}>
              <Descriptions.Item label="输入参数">
                <Collapse
                  expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                  activeKey={defaultActiveKey}
                  onChange={handlePanelChange}
                >
                  <Panel key="0" header="请求参数（Headers）" className={styles.luaPanel}>
                    <div className={styles.paramTable}>
                      <div>
                        <div className={styles.intro}>使用说明</div>
                        <div style={{ marginBottom: 10 }}>
                          {(methods.headers && methods.headers.desc) || '-'}
                        </div>
                      </div>
                      <div className={styles.intro}>参数详情</div>
                      <ParamTable list={methods?.headers?.headers || []} />
                    </div>
                  </Panel>
                  <Panel key="1" header="请求参数（Query）" className={styles.luaPanel}>
                    <div className={styles.paramTable}>
                      <div>
                        <div className={styles.intro}>使用说明</div>
                        <div style={{ marginBottom: 10 }}>
                          {(methods.queries && methods.queries.desc) || '-'}
                        </div>
                      </div>
                      <div className={styles.intro}>参数详情</div>
                      <ParamTable list={methods?.queries?.queries || []} />
                    </div>
                  </Panel>
                  <Panel key="2" header="请求参数（Body）" className={styles.luaPanel}>
                    <div className={styles.paramTable}>
                      <div>
                        <div className={styles.intro}>使用说明</div>
                        <div style={{ marginBottom: 10 }}>
                          {(methods.body && methods.body.desc) || '-'}
                        </div>
                      </div>
                      <div className={styles.codeWrap}>
                        <div className={styles.intro}>参数详情</div>
                        <CodeEditor value={(methods.body && methods.body.body) || '-'} readOnly />
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </Descriptions.Item>
              <Descriptions.Item label="输出参数">
                <div className={styles.paramTable} style={{ marginTop: 0 }}>
                  <ParamTable list={methods?.rets?.restReturns || []} />
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="请求示例">
                <div className={styles.paramTable} style={{ marginTop: 0 }}>
                  <CodeEditor
                    mode="json"
                    value={info.example}
                    placeholder="请输入正确的请求示例，可以点击“生成请求示例”自动生成示例"
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
            <div className={styles.divider} />
            <DataChainItem info={{ ...info, type: 'interface' }} />
          </div>
        ) : (
          <PermissionDenied />
        )}
      </Page>
      <OfflineModal
        isModalVisible={offlineModalVisible}
        onOk={handleOffline}
        handleCancel={() => setOfflineModalVisible(false)}
      />
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(ModalDetail);
