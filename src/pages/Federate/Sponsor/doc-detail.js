import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Empty, IconBase, Row } from 'quanta-design';
import Page from '@/components/Page';
import BaseData from '@/pages/Federate/Sponsor/components/base_data';
import ItemTitle from '@/components/ItemTitle';
import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import CodeEditor from '@/components/CodeEditor';
import { getRestfulInfo } from '@/services/sponsor';
import { connect } from 'dva';
import styles from './index.less';
import { router } from 'umi';
import WithLoading from '@/components/WithLoading';

function DocDetail(props) {
  const {
    location: { query = {} },
    dispatch,
  } = props;
  const { taskId } = query;
  const [methods, setMethods] = useState({});
  const { params = {} } = methods;
  const alert = (
    <Alert
      type="info"
      showIcon
      message="温馨提示：隐私计算任务重新部署后当前接口会失效，需要重新生成接口。"
    />
  );

  const empty = (
    <Empty
      className={styles.emptyBox}
      description={<div style={{ color: '#888' }}>无参数</div>}
      image={<IconBase width="72" viewBox="0 0 72 72" height="72" icon={EmptyIcon} fill="#000" />}
    />
  );

  const initData = async () => {
    const data = await getRestfulInfo(taskId, dispatch);
    setMethods(data);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleRefresh = () =>
    router.push(`/federate/sponsor/make-interface?taskId=${methods.task_id}&isEdit=true`);

  return (
    <>
      <Page
        title="文档详情"
        showBackIcon
        className={styles.docPage}
        alert={alert}
        extra={<Button onClick={handleRefresh}>更新</Button>}
      >
        <BaseData info={methods} className={styles.baseContainer} />
        <ItemTitle title="参数信息" />
        <div className={styles.detailPage}>
          <div className={styles.parameters}>
            <div className={styles.boldTxt} style={{ padding: 0 }}>
              调用方法
            </div>
            <div>{params?.func_name || '-'}</div>
          </div>
          <div className={styles.parameters} style={{ marginTop: 0 }}>
            <div className={styles.boldTxt}>输入参数</div>
            <div className={styles.paramTable}>
              <Row align="middle" className={styles.tableThead}>
                <Col className={styles.outputItem} style={{ paddingLeft: 12 }}>
                  名称
                </Col>
                <Col className={styles.outputItem}>类型</Col>
                <Col className={styles.outputItem}>示例值</Col>
                <Col className={styles.outputItem}>描述</Col>
              </Row>
              {params && params.args && params.args.length > 0
                ? params.args.map(li => (
                    <Row align="middle" key={li.name} className={styles.tableTr}>
                      <Col className={styles.outputItem} style={{ paddingLeft: 12 }}>
                        {li.name || '-'}
                      </Col>
                      <Col className={styles.outputItem}>{li.type || '-'}</Col>
                      <Col className={styles.outputItem}>{li.example || '-'}</Col>
                      <Col className={styles.outputItem}>{li.desc || '-'}</Col>
                    </Row>
                  ))
                : empty}
            </div>
          </div>
          <div className={styles.parameters}>
            <div className={styles.boldTxt}>输出参数</div>
            <div className={styles.paramTable}>
              <Row align="middle" className={styles.tableThead}>
                <Col className={styles.outputItem} style={{ paddingLeft: 12 }}>
                  名称
                </Col>
                <Col className={styles.outputItem}>类型</Col>
                <Col className={styles.outputItem}>示例值</Col>
                <Col className={styles.outputItem}>描述</Col>
              </Row>
              {params && params.rets && params.rets.length > 0
                ? params.rets.map(li => (
                    <Row align="middle" key={li.name} className={styles.tableTr}>
                      <Col className={styles.outputItem} style={{ paddingLeft: 12 }}>
                        {li.name || '-'}
                      </Col>
                      <Col className={styles.outputItem}>{li.type || '-'}</Col>
                      <Col className={styles.outputItem}>{li.example || '-'}</Col>
                      <Col className={styles.outputItem}>{li.desc || '-'}</Col>
                    </Row>
                  ))
                : empty}
            </div>
          </div>
          <div className={styles.parameters}>
            <div className={styles.text}>请求示例</div>
            <div className={styles.codeBox}>
              <CodeEditor value={methods.req_example} placeholder="-" mode="txt" />
            </div>
          </div>
          <div className={styles.parameters} style={{ marginTop: 15 }}>
            <div className={styles.text}>正常返回</div>
            <div className={styles.codeBox}>
              <CodeEditor value={methods.result_example} placeholder="-" mode="txt" />
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}

export default connect(({ global }) => ({
  loading: global.loading,
}))(WithLoading(DocDetail));
