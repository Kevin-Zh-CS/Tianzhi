import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Table, Pagination, Alert, Tabs } from 'quanta-design';
import { ARGS_TYPE_TEXT, authList, PRIVATE_TYPE, PROJECT_STATUS } from '@/utils/enums';
import OrderStatus from '@/components/OrderStatus';
// import { parserInfoContent } from '@/services/qfl';
import styles from './index.less';
import { DATA_THEME } from '@/pages/Manage/Outer/config';
import { getValueFromList } from '@/utils/helper';
import { getLists } from '@/services/importer';
// import { getQflAnalysis } from '@/services/qfl-sponsor';
// import {PROJECT_STATUS_TAG, Step} from "@/pages/Qfl/config";

function DataDetailModal(props) {
  const {
    visible,
    onCancel,
    data_name,
    format_desc,
    refuse_invite_reason,
    data_id,
    projectId,
    isSponsor = false,
    args = [],
    require_format = [],
    participant_user_id = '',
    participant_org_name = '',
    data_status,
    data_source,
    data_hash,
    data_desc,
    data_topics,
    is_private,
    pub_type,
    name,
    desc,
  } = props;
  const [dataRowList, setDataRowList] = useState({});
  const [currentPage, setCurrent] = useState(1);

  const columns = [];
  if (dataRowList?.records?.length > 0) {
    Object.keys(dataRowList.records[0]).forEach(res => {
      columns.push({
        key: res,
        dataIndex: res,
        title: res,
        render: text => <div style={{ minWidth: 80 }}>{text}</div>,
      });
    });
  }

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

  const initList = async (page = 1) => {
    const params = {
      namespace: projectId,
      data_id,
      fields: [],
      page,
      size: 5,
    };
    const list = await getLists(params);
    setDataRowList(list);
  };

  const changePage = current => {
    initList(current);
    setCurrent(current);
  };

  useEffect(() => {
    if (visible && isSponsor) {
      initList();
    }
  }, [visible, data_source]);

  const getTopicsStr = function(topics) {
    return (topics || []).map(item => (
      <span style={{ marginRight: 8 }} key={item.key}>
        {DATA_THEME[item].value}
      </span>
    ));
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      style={{ minWidth: 888 }}
      title="数据详情"
      footer={null}
      visible={visible}
      onCancel={onCancel}
      bodyStyle={{ maxHeight: 600, overflow: 'scroll' }}
    >
      {isSponsor ? (
        <div>
          <Alert type="info" message="温馨提示：只有发起方的本地数据支持统计分析。" showIcon />
          <Tabs>
            <Tabs.TabPane tab="数据元信息" key="0">
              {/* <Tabs.TabPane tab="数据元信息" key="0"> */}
              <Descriptions>
                <Descriptions.Item label="导入方式">上传数据</Descriptions.Item>
                <Descriptions.Item label="数据名称">{name}</Descriptions.Item>
                <Descriptions.Item label="数据描述">{desc}</Descriptions.Item>
                <Descriptions.Item label="参数信息">
                  <Table
                    columns={argsColumns}
                    dataSource={args}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="数据内容">
                  <div style={{ marginBottom: 10 }}>共{dataRowList.total}条数据</div>
                  <div className={styles.tableContent}>
                    <Table
                      columns={columns}
                      dataSource={dataRowList.records}
                      emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                      onChange={changePage}
                      pagination={false}
                    />
                    <Pagination
                      className={styles.pagination}
                      total={dataRowList.total}
                      current={currentPage}
                      pageSize={5}
                      onChange={changePage}
                      showSizeChanger={false}
                      showQuickJumper={false}
                    />
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
          </Tabs>
        </div>
      ) : (
        <div>
          {data_source === 2 ? (
            <>
              <div style={{ marginBottom: 20 }}>
                {data_status === PROJECT_STATUS.WAIT_ACCEPT_INVITE && (
                  <OrderStatus
                    status={0}
                    title="待接受"
                    desc="需对任务发起方的邀请进行确认，接受邀请后并添加数据，发起方才能使用该数据。"
                  />
                )}
                {data_status === PROJECT_STATUS.WAIT_PARTICIPANT_CONFIGURE && (
                  <OrderStatus
                    status={3}
                    title="待添加"
                    desc="已接受邀请，但暂未添加数据，需添加数据后发起方才能使用该数据。"
                  />
                )}
                {data_status === PROJECT_STATUS.PARTICIPANT_REJECT && (
                  <OrderStatus
                    status={1}
                    title="已拒绝"
                    desc={
                      <>
                        您已拒绝任务发起方的邀请。。
                        <br />
                        拒绝理由：{refuse_invite_reason}
                      </>
                    }
                  />
                )}
                {(data_status === PROJECT_STATUS.PARTICIPANT_CONFIGURE_FINISHED ||
                  data_status === PROJECT_STATUS.READY) && (
                  <OrderStatus
                    status={2}
                    title="已添加"
                    desc="已接受邀请并添加数据，发起方能使用该数据。"
                  />
                )}
              </div>
              <Descriptions title="参与方信息">
                <Descriptions.Item label="参与方机构">{participant_org_name}</Descriptions.Item>
                <Descriptions.Item label="参与方地址">{participant_user_id}</Descriptions.Item>
              </Descriptions>
              <Descriptions title="数据格式" className={styles.descriptions}>
                <Descriptions.Item label="所需数据名称">{data_name}</Descriptions.Item>
                <Descriptions.Item label="格式说明">{format_desc}</Descriptions.Item>
                <Descriptions.Item label="数据说明">
                  <Table
                    style={{ width: '80%' }}
                    columns={[
                      {
                        title: '名称',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: '类型',
                        dataIndex: 'type',
                        key: 'type',
                      },
                      {
                        title: '示例值',
                        dataIndex: 'example',
                        key: 'example',
                      },
                      {
                        title: '描述',
                        dataIndex: 'desc',
                        key: 'desc',
                      },
                    ]}
                    dataSource={require_format || []}
                    pagination={false}
                  />
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : null}
          {data_source === 3 ? (
            <Descriptions>
              <Descriptions.Item label="数据名称">{data_name}</Descriptions.Item>
              <Descriptions.Item label="数据哈希">{data_hash}</Descriptions.Item>
              <Descriptions.Item label="数据类型">数据源</Descriptions.Item>
              <Descriptions.Item label="所属机构">{participant_org_name}</Descriptions.Item>
              <Descriptions.Item label="数据描述">{data_desc}</Descriptions.Item>
              <Descriptions.Item label="数据主题">{getTopicsStr(data_topics)}</Descriptions.Item>
              <Descriptions.Item label="使用限制">
                {PRIVATE_TYPE[is_private ? 1 : 0]}
              </Descriptions.Item>
              <Descriptions.Item label="是否审核">-</Descriptions.Item>
              <Descriptions.Item label="审核内容">-</Descriptions.Item>
              <Descriptions.Item label="共享类型">
                {getValueFromList(pub_type, authList)}
              </Descriptions.Item>
              <Descriptions.Item label="数据说明">
                <div className={styles.tableContent}>
                  <Table
                    columns={[
                      {
                        title: '名称',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: '类型',
                        dataIndex: 'type',
                        key: 'type',
                      },
                      {
                        title: '示例值',
                        dataIndex: 'example',
                        key: 'example',
                      },
                      {
                        title: '描述',
                        dataIndex: 'desc',
                        key: 'desc',
                      },
                    ]}
                    dataSource={require_format}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    pagination={false}
                  />
                </div>
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

export default DataDetailModal;
