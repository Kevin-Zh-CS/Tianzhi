import React, { useState, useEffect } from 'react';
import { Table, Descriptions, Pagination, Spin } from 'quanta-design';
import ButtonGroup from '@/components/ButtonGroup';
import { handleParticipantInviteConfirm } from '@/services/qfl-partner';
import styles from './index.less';
import { getNewImportDataInfo, getLists } from '@/services/importer';

function Step2(props) {
  const { projectId, value, onCancel, onOk, dataId } = props;
  const [currentPage, setCurrent] = useState(1);
  const [dataInfo, setDataInfo] = useState({});
  const [dataRowList, setDataRowList] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [namespace, data] = value.data;
  const columns = [];

  const { args = [] } = dataInfo;
  if (args && args.length) {
    args.forEach(res => {
      columns.push({
        key: res.name,
        dataIndex: res.name,
        title: res.name,
        render: txt => <div className={styles.column}>{txt}</div>,
      });
    });
  }

  const initInfo = async () => {
    const detail = await getNewImportDataInfo({ dataId: data, namespace });
    setDataInfo(detail);
  };

  const initList = async (page = 1, size = 10) => {
    const list = await getLists({ namespace, fields: [], data_id: data, page, size });
    setDataRowList(list);
  };
  const loadData = async () => {
    setLoading(true);
    try {
      await initInfo();
      await initList();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const changePage = async (current, pageSize) => {
    setTableLoading(true);
    try {
      await initList(current, pageSize);
      setCurrent(current);
    } finally {
      setTableLoading(false);
    }
  };

  const onSubmit = async () => {
    await handleParticipantInviteConfirm({
      initiator_data_id: dataId,
      participant_data_id: data,
      project_id: projectId,
    });
    onOk();
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.step2}>
        <Descriptions title="数据详情">
          <Descriptions.Item label="数据名称">{dataInfo.name}</Descriptions.Item>
          <Descriptions.Item label="数据描述">{dataInfo.desc}</Descriptions.Item>
          <Descriptions.Item label="数据内容">
            <div>
              <div style={{ marginBottom: 8 }}>共{dataRowList.total || 0}条数据</div>
              <div>
                <Table
                  columns={columns}
                  loading={tableLoading}
                  dataSource={dataRowList.records}
                  emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                  pagination={false}
                />
                <Pagination
                  className={styles.pagination}
                  total={dataRowList.total}
                  current={currentPage}
                  onChange={changePage}
                  showSizeChanger
                  showQuickJumper
                />
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>
        <ButtonGroup
          change
          left="确认添加"
          onClickL={onSubmit}
          right="上一步"
          onClickR={onCancel}
          style={{ marginLeft: 88 }}
        />
      </div>
    </Spin>
  );
}

export default Step2;
