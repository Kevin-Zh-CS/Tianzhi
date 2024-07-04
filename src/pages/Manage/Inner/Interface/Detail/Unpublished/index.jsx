import React, { useState, useEffect } from 'react';
import { Alert, Button, IconBase, Descriptions, message } from 'quanta-design';
import router from 'umi/router';
import Page from '@/components/Page';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { Collapse } from 'antd';
import { interfaceInfo } from '@/services/interface';
import CodeEditor from '@/components/CodeEditor';
import { CaretRightOutlined } from '@ant-design/icons';
import styles from './index.less';
import { connect } from 'dva';
import AddUser from '@/pages/Manage/component/AddUser';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import { PERMISSION } from '@/utils/enums';

const { Panel } = Collapse;

function InterfaceDetail(props) {
  const { location, style } = props;
  const { id, namespace } = location.query;
  const [info, setInfo] = useState({});
  const methods = info.args ? JSON.parse(info.args) : {};
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const getInfo = async () => {
    const data = await interfaceInfo(namespace, id);
    setInfo(data);
    return data;
  };

  const getActiveKey = data => {
    const activeKeys = [];
    const dataMethods = data.args ? JSON.parse(data.args) : {};
    if (dataMethods.headers && JSON.stringify(dataMethods.headers) !== '{}') {
      activeKeys.push('0');
    }
    if (dataMethods.body && JSON.stringify(dataMethods.body) !== '{}') {
      activeKeys.push('1');
    }
    if (dataMethods.queries && JSON.stringify(dataMethods.queries) !== '{}') {
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

  const share = () => {
    const url = window.location.href;
    const oInput = document.createElement('input');
    oInput.value = url;
    document.body.appendChild(oInput);
    oInput.select();
    document.execCommand('Copy');
    oInput.className = 'oInput';
    oInput.style.display = 'none';
    message.success('数据链接复制成功，可以通过链接快速访问');
  };

  const handlePanelChange = e => {
    setDefaultActiveKey(e);
  };

  return (
    <div>
      <Page
        title="数据详情"
        alert={
          auth.includes(PERMISSION.query) ? (
            <Alert
              type="info"
              message={
                <span>
                  温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。
                </span>
              }
              showIcon
            />
          ) : null
        }
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <AddUser namespace={namespace} resourceId={id} auth={auth} />
            {auth.includes(PERMISSION.publish) && info.status === 0 ? (
              <Button
                type="primary"
                onClick={() => {
                  router.push(
                    `/manage/inner/repository/interface/publish?namespace=${namespace}&id=${id}`,
                  );
                }}
              >
                发布
              </Button>
            ) : null}
          </>
        }
        showBackIcon
        noContentLayout
        className={styles.unpublishedPage}
      >
        {auth.includes(PERMISSION.query) ? (
          <div className={styles.contentWrap} style={style}>
            <DataItem info={{ ...info, type: 'interface' }} auth={auth} />
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
                        <div style={{ marginBottom: 8 }}>
                          {(methods.headers && methods.headers.desc) || '-'}
                        </div>
                      </div>
                      <ParamTable list={methods?.headers?.headers || []} />
                    </div>
                  </Panel>
                  <Panel key="1" header="请求参数（Query）" className={styles.luaPanel}>
                    <div className={styles.paramTable}>
                      <div>
                        <div className={styles.intro}>使用说明</div>
                        <div style={{ marginBottom: 8 }}>
                          {(methods.queries && methods.queries.desc) || '-'}
                        </div>
                      </div>
                      <ParamTable list={methods?.queries?.queries || []} />
                    </div>
                  </Panel>
                  <Panel key="2" header="请求参数（Body）" className={styles.luaPanel}>
                    <div className={styles.paramTable}>
                      <div>
                        <div className={styles.intro}>使用说明</div>
                        <div style={{ marginBottom: 8 }}>
                          {(methods.body && methods.body.desc) || '-'}
                        </div>
                      </div>
                      <div className={styles.codeWrap}>
                        <CodeEditor value={info.model} readOnly />
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              </Descriptions.Item>
              <Descriptions.Item label="输出参数">
                <div className={styles.paramTable} style={{ marginTop: 0 }}>
                  <ParamTable list={methods.rets?.restReturns || []} />
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
          </div>
        ) : (
          <PermissionDenied />
        )}
      </Page>
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
  loadingAuth: global.loadingAuth,
}))(InterfaceDetail);
