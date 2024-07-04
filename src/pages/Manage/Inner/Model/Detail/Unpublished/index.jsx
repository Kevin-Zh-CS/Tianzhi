import React, { useState, useEffect } from 'react';
import { Alert, Button, IconBase, Descriptions, Empty, message } from 'quanta-design';
import router from 'umi/router';
import CodeEditor from '@/components/CodeEditor';
import Page from '@/components/Page';
import { modeInfo } from '@/services/resource-model';
import { ReactComponent as ShareIcon } from '@/icons/share.svg';
import { share } from '@/utils/helper';
import { Collapse } from 'antd';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import { CaretRightOutlined } from '@ant-design/icons';
import luaparse from 'luaparse';
import { connect } from 'dva';
import { PUBLISH_INIT_STATUS } from '../../config';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import AddUser from '@/pages/Manage/component/AddUser';
import ParamTable from '@/pages/Manage/component/ParamTable';
import DataItem from '@/pages/Manage/component/DataItem';
import { PERMISSION } from '@/utils/enums';

const { Panel } = Collapse;

function ModalDetail(props) {
  const { location, style } = props;
  const { id, namespace } = location.query;
  const [info, setInfo] = useState({});

  const auth = useAuth({ ns_id: namespace, resource_id: id });

  const getInfo = async () => {
    const data = await modeInfo(namespace, id);
    setInfo(data);
  };

  useEffect(() => {
    getInfo();
  }, []);

  const goToPublish = () => {
    const parseResult = luaparse
      .parse(info.model)
      .body.filter(item => item.type === 'FunctionDeclaration');
    if (parseResult.length > 0) {
      router.push(`/manage/inner/repository/model/publish?namespace=${namespace}&id=${id}`);
    } else {
      message.warn('该模型未识别到调用方法，请完善后再发布！');
    }
  };
  const methods = info.args ? JSON.parse(info.args) : [];
  return (
    <div>
      <Page
        title="数据详情"
        alert={
          <Alert
            type="info"
            message="温馨提示：数据发布时仅发布数据元信息（如数据名称、数据描述等）至区块链，并可为某些机构设置默认的数据访问权限；原始数据不发布。"
            showIcon
          />
        }
        status={
          <>
            <Button icon={<IconBase icon={ShareIcon} fill="#888888" />} onClick={share} />
            <AddUser namespace={namespace} resourceId={id} auth={auth} />
            {auth.includes(PERMISSION.publish) && info.status === PUBLISH_INIT_STATUS.init ? (
              <Button type="primary" onClick={goToPublish}>
                发布
              </Button>
            ) : null}
          </>
        }
        showBackIcon
        noContentLayout
        className={styles.unpublishedPage}
      >
        <div style={style} className={styles.contentWrap}>
          <DataItem info={{ ...info, type: 'model' }} auth={auth} />
          <Descriptions className={styles.infoContent}>
            <Descriptions.Item label="模型内容">
              {auth.includes(PERMISSION.edit) && (
                <div>
                  <Button
                    type="primary"
                    size="small"
                    className={styles.editButton}
                    onClick={() =>
                      router.push(
                        `/manage/inner/repository/model/editor?namespace=${namespace}&id=${id}`,
                      )
                    }
                  >
                    编辑模型
                  </Button>
                </div>
              )}
              <CodeEditor value={info.model} placeholder="rul代码" readOnly />
            </Descriptions.Item>
            <Descriptions.Item label="参数信息">
              {methods.length > 0 ? (
                <Collapse
                  defaultActiveKey={['0']}
                  expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
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
                          <CodeEditor value={item.reqExample} placeholder="-" readOnly />
                        </div>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <div>
                  <Empty
                    style={{ paddingTop: 35 }}
                    description={
                      <div style={{ color: '#888' }}>暂无参数信息，快去模型中完善吧～</div>
                    }
                    image={
                      <IconBase
                        width="72"
                        viewBox="0 0 72 72"
                        height="72"
                        icon={EmptyIcon}
                        fill="#000"
                      />
                    }
                  />
                </div>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Page>
    </div>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
  loadingAuth: global.loadingAuth,
}))(ModalDetail);
