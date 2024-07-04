import React, { useEffect, useState } from 'react';
import { Table, Tabs, Descriptions } from 'quanta-design';

import { getPreprocessDataResult, getPreprocessJobResult } from '@/services/qfl-sponsor';
import styles from './index.less';
import { STEP_STATUS } from '@/pages/Qfl/config';
import Logs from '@/pages/Qfl/sponsor/project/componments/Logs';

function OutputItemDetail(props) {
  const { jobId, status, projectId, isPartner } = props;
  const [dataContent, setDataContent] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const [tab, setTab] = useState('0');

  const columns = [];

  const paramColumns = [];
  const scaleColumns = [
    {
      key: 'index',
      dataIndex: 'index',
      title: 'index',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
    {
      key: 'variable',
      dataIndex: 'variable',
      title: 'variable',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
    {
      key: 'columnLower',
      dataIndex: 'columnLower',
      title: 'columnLower',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
    {
      key: 'columnUpper',
      dataIndex: 'columnUpper',
      title: 'columnUpper',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
    {
      key: 'mean',
      dataIndex: 'mean',
      title: 'mean',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
    {
      key: 'std',
      dataIndex: 'std',
      title: 'std',
      render: txt => <div className={styles.column}>{txt}</div>,
    },
  ];

  if (dataContent.intersection_content && dataContent.intersection_content.length) {
    const args = Object.keys(dataContent.intersection_content[0]);
    args.forEach(res => {
      paramColumns.push({
        key: res,
        dataIndex: res,
        title: res,
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

  const asyncColumns = [
    {
      title: '字段名称',
      dataIndex: 'name',
    },
    {
      title: '样本数量',
      dataIndex: 'count',
      render: text => `${text || 0}条`,
    },
    {
      title: '缺失比例',
      dataIndex: 'missing_ratio',
      render: text => `${text || 0}`,
    },
  ];

  const initJobResult = async () => {
    const list = await getPreprocessJobResult(jobId);
    setDataContent(list);
  };

  const initList = async (page = 1, size = 100) => {
    const list = await getPreprocessDataResult({ job_id: jobId, page, size });
    setDataRowList(list);
  };

  const handleChangeTab = key => {
    setTab(key);
    if (key === '1') {
      initList();
    }
  };

  useEffect(() => {
    if (status && status !== STEP_STATUS.fail && !isPartner) {
      initJobResult();
    }
  }, [status]);

  return (
    <>
      <Tabs className={styles.outputDescription} onChange={handleChangeTab}>
        {status === STEP_STATUS.fail || isPartner ? null : (
          <>
            <Tabs.TabPane tab="任务结果" key="0">
              <Descriptions title="ID对齐结果">
                <Descriptions.Item>
                  <Table
                    columns={paramColumns}
                    dataSource={dataContent.intersection_content}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
              </Descriptions>

              {dataContent.scale_content && dataContent.scale_content.length ? (
                <>
                  <div className={styles.dividerLine} />
                  <Descriptions title="无量纲化结果">
                    <Descriptions.Item>
                      <Table
                        columns={scaleColumns}
                        dataSource={dataContent.scale_content}
                        emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                        pagination={false}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </>
              ) : null}
            </Tabs.TabPane>
            <Tabs.TabPane tab="数据结果" key="1">
              <Descriptions className={styles.outputDescription}>
                <Descriptions.Item label="数据统计">
                  <Table
                    className={styles.dataContent}
                    columns={asyncColumns}
                    dataSource={dataRowList.statistics || []}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="数据内容">
                  <div className={styles.totalNum}>
                    本次任务共计输出{dataRowList.total || 0}条数据
                    {dataRowList.total > 100 ? '（仅展示前100条）' : null}
                  </div>
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
    </>
  );
}

export default OutputItemDetail;
