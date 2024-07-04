import React, { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, IconBase, Dropdown, Menu, message } from 'quanta-design';
import { Collapse } from 'antd';
import ItemTitle from '@/components/ItemTitle';
import classnames from 'classnames';
import CodeEditor from '@/components/CodeEditor';
import Page from '@/components/Page';
import router from 'umi/router';
import { CaretRightOutlined } from '@ant-design/icons';
import { modeInfo, downloadSingleModel } from '@/services/resource-model';
import { connect } from 'dva';
import styles from './index.less';
import { share } from '@/utils/helper';
import { setOffline } from '@/services/resource';
import { PUBLISH_INIT_STATUS } from '@/pages/Manage/Inner/config';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import OfflineModal from '@/pages/Manage/Inner/component/OfflineModal';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import AddUser from '@/pages/Manage/component/AddUser';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import DataChainItem from '@/pages/Manage/component/DataChainItem';
import { PERMISSION } from '@/utils/enums';

const { Panel } = Collapse;

function ModalDetailPublished(props) {
  const { namespace, id, style } = props;
  const [info, setInfo] = useState({});
  const [showFloat, setShowFloat] = useState(false);
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const getInfo = async () => {
    const data = await modeInfo(namespace, id);
    setInfo(data);
  };

  const goToEditor = () => {
    router.push(
      `/manage/inner/repository/model/editor?id=${info.id}&namespace=${namespace}&type=edit`,
    );
  };

  const handleOffline = async () => {
    await setOffline(info.id);
    message.success('数据下架成功！');
    setOfflineModalVisible(false);
    await getInfo();
  };

  const download = async () => {
    await downloadSingleModel(namespace, info.id, info.name);
    message.success('数据下载成功！');
  };

  const methods = info.args ? JSON.parse(info.args) : [];
  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setOfflineModalVisible(true)}>下架数据</a>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (auth.includes(PERMISSION.query)) getInfo();
  }, [auth]);

  const goBack = () => {
    if (props.needGoback) {
      router.goBack();
    } else {
      router.replace(`/manage/inner/repository/model?namespace=${namespace}`);
    }
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
            {auth.includes(PERMISSION.usage) && <Button onClick={download}>下载</Button>}
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
          <div style={style}>
            <div style={{ position: 'relative' }}>
              <div className={classnames(styles.floatModal, showFloat ? '' : styles.hidden)}>
                <div
                  className={styles.btn}
                  onClick={() => {
                    setShowFloat(false);
                  }}
                >
                  <div className={styles.horizontal} />
                </div>
                <div className={styles.title}>
                  <span>{info.title}</span>
                </div>
                <div className={styles.nameWrap}>
                  <span>{info.name}</span>
                  <Button size="small" type="primary" onClick={goToEditor}>
                    查看脚本
                  </Button>
                </div>
                <div className={styles.codeWrap}>
                  <CodeEditor value={info.model} placeholder="rul代码" readOnly />
                </div>
              </div>
            </div>
            <div className={styles.contentWrap}>
              {auth.includes(PERMISSION.query) && (
                <ItemTitle
                  title="数据元信息"
                  extra={
                    <Button
                      onClick={() => {
                        setShowFloat(true);
                      }}
                    >
                      查看原始数据
                    </Button>
                  }
                />
              )}
              <DataItem
                info={{ ...info, type: 'model', isPublish: true }}
                auth={auth}
                loadData={getInfo}
              />
              <Descriptions className={styles.infoContent}>
                <Descriptions.Item label="参数信息">
                  <Collapse
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    defaultActiveKey={methods.map((item, i) => i.toString())}
                  >
                    {methods.map((item, i) => (
                      <Panel key={i.toString()} header={item.name} className={styles.luaPanel}>
                        <div className={styles.parameters}>
                          <div className={styles.desc}>使用说明</div>
                          <div className={styles.sub_intro}>{item.desc || '-'}</div>
                          <div className={styles.intro}>输入参数</div>
                          <div className={styles.paramTable}>
                            <ParamTable list={item?.inputs || []} />
                          </div>
                          <div className={styles.intro}>输出参数</div>
                          <div className={styles.paramTable}>
                            <ParamTable list={item?.outputs || []} />
                          </div>
                          <div className={styles.intro}>请求示例</div>
                          <div className={styles.paramTable}>
                            <CodeEditor
                              value={item.reqExample}
                              placeholder="-"
                              mode="txt"
                              readOnly
                            />
                          </div>
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </Descriptions.Item>
              </Descriptions>
              <div className={styles.divider} />
              <DataChainItem info={{ ...info, type: 'model' }} />
            </div>
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
  loadingAuth: global.loadingAuth,
}))(ModalDetailPublished);
