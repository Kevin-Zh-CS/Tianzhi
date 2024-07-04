import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Row, Col, Tabs, Button, Tooltip, message } from 'quanta-design';
import { goDownload, STEP_STATUS } from '@/pages/Qfl/config';
import HotCharts from '@/pages/Qfl/sponsor/project/componments/HotCharts';
import RocCharts from '@/pages/Qfl/sponsor/project/componments/RocCharts';
import KsCharts from '@/pages/Qfl/sponsor/project/componments/KsCharts';
import {
  getModelDataResult,
  getModelEvaluationResult,
  getModelJobResult,
} from '@/services/qfl-sponsor';
import { router } from 'umi';
import styles from './index.less';
import { downloadModel } from '@/services/qfl-modal';
import Logs from '@/pages/Qfl/sponsor/project/componments/Logs';
import CodeEditor from '@/components/CodeEditor';

const { TabPane } = Tabs;
function OutputItemDetail(props) {
  const { jobId, step, projectId, dataInfo, isPartner } = props;
  const { job_config = {}, status, model_saved } = dataInfo;
  const { common = {} } = job_config;
  const [list, setList] = useState({});
  const [current, setCurrent] = useState('train');
  const [dataResult, setDataResult] = useState({});
  const [metaList, setMetaList] = useState({});
  const [detailList, setDetailList] = useState([]);
  const [kMeansList, setKMeansList] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [tab, setTab] = useState('0');
  const [multiTab, setMultiTab] = useState('0');

  const tabList = detailList.map((item, index) => {
    if (item.meta && item.meta.className) {
      return {
        label: `model${index}(${item.meta.className}和非${item.meta.className})`,
        key: index,
      };
    }

    return [];
  });

  const columns = [];
  const detailColumns = [];
  const multiColumns = [];
  const stepThreeColumns = [
    {
      key: 'base_component',
      dataIndex: 'base_component',
      title: '',
      render: txt => <div className={styles.column}>{txt || '-'}</div>,
    },
  ];
  const kMeansParams = [];
  const stepThreeTableColumns = [];

  if (dataResult.content && dataResult.content.length) {
    const args = Object.keys(dataResult.content[0]);
    args.forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }
  if (detailList && detailList.length) {
    const args = Object.keys(detailList[0]);
    args.forEach(res => {
      detailColumns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  if (
    detailList &&
    detailList.length &&
    detailList[multiTab] &&
    detailList[multiTab].content &&
    detailList[multiTab].content.length
  ) {
    const args = Object.keys(detailList[multiTab].content[0]);
    args.forEach(res => {
      multiColumns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  if (list[current]) {
    const args = Object.keys(list[current]);
    args.forEach(res => {
      if (
        list[current][res] &&
        typeof list[current][res] !== 'object' &&
        res !== 'base_component'
      ) {
        stepThreeColumns.push({
          key: res,
          dataIndex: res,
          title: res,
          render: txt => <div className={styles.column}>{txt}</div>,
        });
      }
    });
    const { contingency_matrix } = list[current];
    if (contingency_matrix) {
      const args1 = Object.keys(contingency_matrix[0]);
      args1.forEach(res => {
        stepThreeTableColumns.push({
          key: res,
          dataIndex: res,
          title: res,
          render: txt => <div className={styles.column}>{txt}</div>,
        });
      });
    }
    // stepThreeTableColumns
  }

  if (kMeansList && kMeansList.length) {
    const args = Object.keys(kMeansList[0]);
    args.forEach(res => {
      kMeansParams.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  const initJobResult = async () => {
    const data = await getModelJobResult(jobId);
    setMetaList(data.meta);
    setDetailList(data.content || data.multi_contents);
    setContributions(data.contribution_info || []);
    setKMeansList(data.cluster_info);
  };

  // getModelEvaluationResult
  const getEvaluationList = async () => {
    const res = await getModelEvaluationResult(jobId);
    setList(res);
  };

  const handleTabChange = val => {
    setCurrent(val);
  };

  const getDataResultList = async () => {
    const data = await getModelDataResult(jobId);
    setDataResult(data);
  };

  const handleChangeTab = key => {
    // handleTotal(key);
    setTab(key);
    if (key === '1') {
      getDataResultList();
    } else if (key === '2') {
      getEvaluationList();
    }
  };
  useEffect(() => {
    if (step && status && status !== STEP_STATUS.fail && !isPartner) {
      initJobResult();
    }
  }, [step, status]);

  const handleSaveModal = () => {
    router.push(`/qfl/sponsor/project/detail/modal-add?jobId=${jobId}&projectId=${projectId}`);
  };

  const download = async () => {
    downloadModel({
      job_id: jobId,
      model_id: null,
      project_id: projectId,
      type: 1,
    }).then(res => {
      if (res.status === 200) {
        goDownload(res);
        message.success('模型导出成功！');
      }
    });
  };

  const handleMultiTab = key => {
    setMultiTab(key);
  };

  return (
    <Tabs className={styles.outputDescription} onChange={handleChangeTab}>
      {status === STEP_STATUS.fail || isPartner ? null : (
        <>
          <TabPane tab="任务结果" key="0">
            {common.approach === 'dnn' ? (
              <Descriptions>
                <Descriptions.Item label="模型内容">
                  <CodeEditor
                    width={300}
                    height={500}
                    mode="json"
                    value={JSON.stringify(detailList, null, 2)}
                    readOnly
                    placeholder="暂无数据"
                  />
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <>
                <Descriptions className={styles.outputDescription} column={3}>
                  {/* 判断是否为k-means */}
                  {common.approach === 'kmeans' ? (
                    <Descriptions.Item label="聚类数">{common.k}</Descriptions.Item>
                  ) : null}
                  {common.approach === 'logistic-regression' &&
                  common?.task_type === 'multi' ? null : (
                    <>
                      <Descriptions.Item label="实际迭代数">{metaList.iters}</Descriptions.Item>
                      <Descriptions.Item label="是否收敛">
                        {metaList.isConverged ? '是' : '否'}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
                {common.approach === 'kmeans' ? (
                  <Descriptions className={styles.outputDescription}>
                    <Descriptions.Item label="聚类信息">
                      <Table
                        columns={kMeansParams}
                        dataSource={kMeansList || []}
                        emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                        pagination={false}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                ) : null}
                <Descriptions className={styles.outputDescription}>
                  <Descriptions.Item label="模型内容">
                    {common.approach === 'logistic-regression' && common?.task_type === 'multi' ? (
                      <div className={styles.stepTwoTabs}>
                        <Tabs onChange={handleMultiTab} type="card" activeKey={multiTab}>
                          {tabList.map(item => (
                            <TabPane tab={item.label} key={item.key} />
                          ))}
                        </Tabs>
                        <div className={styles.multiDescription}>
                          <Descriptions column={2}>
                            <Descriptions.Item label="实际迭代数">
                              {detailList[multiTab]?.meta?.iters}
                            </Descriptions.Item>
                            <Descriptions.Item label="是否收敛">
                              {detailList[multiTab]?.meta?.isConverged ? '是' : '否'}
                            </Descriptions.Item>
                          </Descriptions>
                        </div>
                        <Table
                          columns={multiColumns}
                          dataSource={detailList[multiTab]?.content || []}
                          emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                          pagination={false}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: 12 }}>
                          <Tooltip title={model_saved === 1 ? '该模型已存在，无需重复保存！' : ''}>
                            <Button
                              type="primary"
                              onClick={handleSaveModal}
                              disabled={model_saved === 1}
                            >
                              保存模型
                            </Button>
                          </Tooltip>
                          <Tooltip title="导出模型">
                            <Button
                              onClick={download}
                              icon={<i className="iconfont icontongyongxing_xiazai_x" />}
                              style={{ marginLeft: 8 }}
                            />
                          </Tooltip>
                        </div>
                        <Table
                          columns={detailColumns}
                          dataSource={detailList || []}
                          emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                          pagination={false}
                        />
                      </>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
            {common.approach === 'logistic-regression' &&
            common?.task_type === 'binary' &&
            contributions.length ? (
              <Descriptions>
                <Descriptions.Item label="贡献评估">
                  <Table
                    columns={[
                      {
                        key: 'participant',
                        dataIndex: 'participant',
                        title: '参与方',
                      },
                      {
                        key: 'contribution',
                        dataIndex: 'contribution',
                        title: '贡献值',
                      },
                    ]}
                    dataSource={contributions || []}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
              </Descriptions>
            ) : null}
          </TabPane>
          <TabPane tab="数据结果" key="1">
            <div className={styles.totalNum} style={{ padding: '0 12px' }}>
              本次任务共计输出{dataResult.total || 0}条数据
              {dataResult.total > 100 ? '（仅展示前100条）' : null}
            </div>
            <Descriptions>
              <Descriptions.Item>
                <Table
                  className={styles.dataContent}
                  columns={columns}
                  dataSource={dataResult.content || []}
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                  pagination={false}
                />
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          {common.approach === 'logistic-regression' && common.task_type === 'multi' ? null : (
            <TabPane tab="评估结果" key="2">
              <Descriptions className={styles.outputDescription}>
                <div className={styles.stepTwoTabs}>
                  <Tabs onChange={handleTabChange} type="card" activeKey={current}>
                    <TabPane tab="训练集" key="train" />
                    {list.test ? <TabPane tab="测试集" key="test" /> : null}
                    {list.validate ? <TabPane tab="验证集" key="validate" /> : null}
                  </Tabs>
                </div>
                <Descriptions.Item label="评估参数">
                  <Table
                    columns={stepThreeColumns}
                    dataSource={[list[current]]}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />

                  {list[current]?.contingency_matrix ? (
                    <Table
                      columns={stepThreeTableColumns}
                      dataSource={list[current].contingency_matrix}
                      emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                      pagination={false}
                      style={{ marginTop: 20 }}
                    />
                  ) : null}
                </Descriptions.Item>
                {common.approach === 'logistic-regression' ? (
                  <Descriptions.Item label="图表展示">
                    {list[current] ? (
                      <>
                        <Row>
                          <Col span={12} style={{ padding: 12 }}>
                            <HotCharts list={list[current]} />
                          </Col>
                          {list[current].roc_curve?.length ? (
                            <Col span={12} style={{ padding: 12 }}>
                              <RocCharts list={list[current]} />
                            </Col>
                          ) : null}
                        </Row>
                        {list[current].ks_curve?.length ? (
                          <Row>
                            <Col span={12} style={{ padding: 12 }}>
                              <KsCharts list={list[current]} />
                            </Col>
                          </Row>
                        ) : null}
                      </>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                ) : null}
              </Descriptions>
            </TabPane>
          )}
        </>
      )}

      <TabPane tab="日志" key="3">
        <Logs
          jobId={jobId}
          projectId={projectId}
          isPartner={isPartner}
          status={status}
          isCurrent={tab === '3'}
        />
      </TabPane>
    </Tabs>
  );
}

export default OutputItemDetail;
