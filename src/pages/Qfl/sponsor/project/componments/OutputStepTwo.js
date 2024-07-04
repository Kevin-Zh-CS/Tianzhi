import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Tabs } from 'quanta-design';
import { STEP_STATUS } from '@/pages/Qfl/config';
import { getFeatureEngineerResult, getFeatureJobResult } from '@/services/qfl-sponsor';
import styles from './index.less';
import CorrelationAnalysisCharts from './CorrelationAnalysisCharts';
import Logs from '@/pages/Qfl/sponsor/project/componments/Logs';

const { TabPane } = Tabs;
function OutputItemDetail(props) {
  const { jobId, step, status, projectId, isPartner } = props;
  const [dataRowList, setDataRowList] = useState({});
  const [params, setParams] = useState([]);
  const [metaList, setMetaList] = useState([]);
  const [detailList, setDetailList] = useState({});
  const [detailMetaList, setDetailMetaList] = useState([]);
  const [pearsonData, setPearsonData] = useState(null);
  const [tab, setTab] = useState('0');

  const columns = [];
  const metaColumns = [];

  const stepTwoParam = [
    {
      title: 'variable',
      dataIndex: 'feature',
      key: 'feature',
    },
    {
      title: 'bin_num',
      dataIndex: 'bin_num',
      key: 'bin_num',
    },
    {
      title: 'IV',
      dataIndex: 'iv',
      key: 'iv',
      showSorterTooltip: false,
      sorter: {
        compare: (a, b) => a.iv - b.iv,
      },
    },
    {
      title: 'Monotonicty',
      dataIndex: 'monotonicty',
      key: 'monotonicty',
      render: text => <span>{`${text}`}</span>,
    },
  ];

  if (detailMetaList && detailMetaList.length) {
    const args = Object.keys(detailMetaList[0]);
    args.forEach(res => {
      metaColumns.push({
        key: res,
        dataIndex: res,
        title: res,
        showSorterTooltip: false,
        sorter:
          res === 'iv' || res === 'woe'
            ? {
                compare: (a, b) => (res === 'iv' ? a.iv - b.iv : a.woe - b.woe),
              }
            : false,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  if (dataRowList.content && dataRowList.content.length) {
    const args = Object.keys(dataRowList.content[0]);
    args.forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  const initDataResult = async () => {
    const data = await getFeatureEngineerResult(jobId);
    setDataRowList(data);
  };

  const initJobResult = async () => {
    const data = await getFeatureJobResult(jobId);
    const { binning_result, pearson_result } = data;
    if (binning_result && binning_result.meta) {
      const param = binning_result.meta.map(item => item.feature);
      setMetaList(binning_result.meta);
      setParams(param);
      setDetailList(binning_result.content);
      setDetailMetaList(param.length > 0 ? binning_result.content[param[0]] : []);
    }

    if (pearson_result && pearson_result.matrix && Object.values(pearson_result.matrix)) {
      setPearsonData(pearson_result.matrix);
    }
  };

  const handleTabChange = val => {
    const data = detailList[val];
    setDetailMetaList(data);
  };

  const handleChangeTab = key => {
    setTab(key);
    if (key === '1') {
      initDataResult();
    }
  };

  useEffect(() => {
    if (step && status && status !== STEP_STATUS.fail && !isPartner) {
      initJobResult();
    }
  }, [step, status]);

  return (
    <Tabs className={styles.outputDescription} onChange={handleChangeTab}>
      {status === STEP_STATUS.fail || isPartner ? null : (
        <>
          <Tabs.TabPane tab="任务结果" key="0">
            {/* 判断是否有特征相关性分析的选项 */}
            {pearsonData ? (
              <>
                <Descriptions title="特征相关性分析结果">
                  <Descriptions.Item label="详细结果">
                    <CorrelationAnalysisCharts list={pearsonData} />
                  </Descriptions.Item>
                </Descriptions>
                <div className={styles.dividerLine} style={{ marginTop: 8 }} />
              </>
            ) : null}
            {metaList.length ? (
              <Descriptions title="分箱结果" className={styles.outputDescription}>
                <Descriptions.Item label="综合结果">
                  <Table
                    columns={stepTwoParam}
                    dataSource={metaList}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="详细结果">
                  <div className={styles.totalNum}>
                    本次任务共计输出{detailMetaList.length || 0}条数据
                    {detailMetaList.length > 100 ? '（仅展示前100条）' : null}
                  </div>

                  <div className={styles.stepTwoTabs}>
                    <Tabs onChange={handleTabChange} type="card">
                      {params.map(item => (
                        <TabPane tab={item} key={item} />
                      ))}
                    </Tabs>
                  </div>
                  <Table
                    columns={metaColumns}
                    dataSource={detailMetaList}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
              </Descriptions>
            ) : null}
          </Tabs.TabPane>
          <Tabs.TabPane tab="数据结果" key="1">
            <div className={styles.totalNum} style={{ padding: '0 12px' }}>
              本次任务共计输出{dataRowList.total || 0}条数据
              {dataRowList.total > 100 ? '（仅展示前100条）' : null}
            </div>
            <Descriptions>
              <Descriptions.Item>
                <Table
                  className={styles.dataContent}
                  columns={columns}
                  dataSource={dataRowList.content}
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                  pagination={false}
                />
              </Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>
        </>
      )}

      <Tabs.TabPane tab="日志" key="2">
        <Logs
          jobId={jobId}
          projectId={projectId}
          isPartner={isPartner}
          status={status}
          isCurrent={tab === '2'}
        />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default OutputItemDetail;
