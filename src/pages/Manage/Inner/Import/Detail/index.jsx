import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { IconBase, Pagination, Tooltip, Descriptions } from 'quanta-design';
import { Table } from 'antd';
import ItemTitle from '@/components/ItemTitle';
import { formatTime } from '@/utils/helper';
import { DATA_RESOURCE_TEXT, ARGS_TYPE_TEXT } from '@/utils/enums.js';
import Page from '@/components/Page';
import { ReactComponent as questionCircleIcon } from '@/assets/question_circle.svg';
import styles from './index.less';
import WithLoading from '@/components/WithLoading';

function Detail(props) {
  const {
    dispatch,
    dataRowList = {},
    dataInfo = {},
    location,
    relatedTaskInfo = [],
    style,
    tableLoading,
  } = props;
  const { namespace, dataId } = location.query;
  const [currentPage, setCurrent] = useState(1);
  const columns = [];

  const arr = Object.keys(dataRowList);
  if (arr.length > 0 && dataRowList.records.length > 0) {
    Object.keys(dataRowList.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: text => <div style={{ minWidth: 80 }}>{text}</div>,
      });
    });
  }
  const formItemLayout = {
    labelCol: { style: { width: 105, textAlign: 'left', marginLeft: 12 } },
    wrapperCol: {},
  };
  const argsColumns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: val => ARGS_TYPE_TEXT[val],
    },
  ];
  const taskInfoColumns = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
    },
    {
      title: '任务发起方',
      dataIndex: 'initiator_org_name',
    },
    {
      title: '邀请时间',
      dataIndex: 'participate_time',
      render: val => formatTime(val),
    },
  ];
  useEffect(() => {
    dispatch({
      type: 'importer/dataRowList',
      payload: {
        dataId,
        namespace,
      },
    });
    dispatch({
      type: 'importer/dataInfo',
      payload: {
        dataId,
        namespace,
      },
    });
    dispatch({
      type: 'importer/relatedTaskInfo',
      payload: {
        dataId,
        namespace,
      },
    });
  }, []);
  const changePage = (current = 1, pageSize = 10) => {
    dispatch({
      type: 'importer/dataRowList',
      payload: {
        dataId,
        namespace,
        page: current,
        size: pageSize,
      },
    });
    setCurrent(current);
  };
  return (
    <div>
      <Page
        title="数据详情"
        onBack={() => router.push(`/manage/inner/repository/import?namespace=${namespace}`)}
        noContentLayout
      ></Page>
      <div className={styles.contentWrap} style={style}>
        <ItemTitle title="数据详情" />
        <Descriptions labelStyle={{ width: 108 }}>
          <Descriptions.Item label="导入方式">
            {DATA_RESOURCE_TEXT[dataInfo.data_type]}
          </Descriptions.Item>
          {dataInfo.data_type === 1 && (
            <Descriptions.Item label="是否导入">
              {dataInfo.is_import ? '关联并导入' : '仅关联不导入'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="数据名称">{dataInfo.name}</Descriptions.Item>
          <Descriptions.Item label="数据描述">{dataInfo.desc}</Descriptions.Item>
          <Descriptions.Item label="参数信息">
            <Table
              columns={argsColumns}
              dataSource={dataInfo.args}
              emptyTableText={<div style={{ color: '#888888' }}>暂无数据～</div>}
              pagination={false}
            />
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <div style={{ display: 'flex', width: 108 }}>
                <span style={{ marginRight: 10 }}>数据内容</span>
                <Tooltip
                  arrowPointAtCenter
                  placement="bottomLeft"
                  title="数据内容：数据内容即导入或关联的数据详情，首次导入或
                    关联时支持增删改查。提交后修改若已关联任务，则不能修
                    改数据内容；若无关联任务，则可以修改数据内容。"
                >
                  <IconBase icon={questionCircleIcon} fontSize={20} fill="#888888" />
                </Tooltip>
              </div>
            }
            {...formItemLayout}
          >
            <div className="overflowTable pageTable">
              <Table
                columns={columns}
                dataSource={dataRowList.records || []}
                emptyTableText={<div style={{ color: '#888888' }}>暂无数据～</div>}
                pagination={false}
                loading={{
                  spinning: tableLoading,
                }}
              />
            </div>
            <div className="overflowPagination">
              <Pagination
                showSizeChanger
                showQuickJumper
                total={dataRowList.total}
                current={currentPage}
                onChange={changePage}
              />
            </div>
          </Descriptions.Item>
          <div className={styles.divider} />
          <ItemTitle title="关联任务详情" />
          <Table columns={taskInfoColumns} dataSource={relatedTaskInfo} />
        </Descriptions>
      </div>
    </div>
  );
}

export default connect(({ importer, loading }) => ({
  dataRowList: importer.dataRowList,
  dataInfo: importer.dataInfo,
  relatedTaskInfo: importer.relatedTaskInfo,
  loading: loading.effects['importer/relatedTaskInfo'],
  tableLoading: loading.effects['importer/dataRowList'],
}))(WithLoading(Detail, { skeletonTemplate: 1 }));
