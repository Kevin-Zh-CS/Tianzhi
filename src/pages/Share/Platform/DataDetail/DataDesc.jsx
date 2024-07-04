import React, { useState } from 'react';
import { Tabs, Alert, Tag, Descriptions, Table, Tooltip } from 'quanta-design';
import { formatTime } from '@/utils/helper';
import { connect } from 'dva';
import { DATA_TYPE_TEXT, DATA_THEME, APPROVE_CONTENT, PRIVATE_TYPE_LIST } from '@/utils/enums.js';
import styles from './index.less';
import OriginDetail from '../components/origin-detail';
import InterfaceDetail from '../components/interface-detail';
import ModelDetail from '../components/model-detail';
import { getTxRecordList } from '@/services/datasharing';
import { getOrderType } from '@/pages/Share/Platform/config';

function DataDesc(props) {
  const { dataDetail = {} } = props;
  const [currentPage, setCurrent] = useState(1);
  const [pSize, setPSize] = useState(10);
  const [txRecordList, setTxRecordList] = useState({});

  const loadData = async (page = 1, size = 10) => {
    const { data_id } = dataDetail;
    setPSize(size);
    const params = {
      page,
      size,
      data_id,
    };
    const res = await getTxRecordList(params);
    setTxRecordList(res);
    setCurrent(page);
  };
  const onChange = ({ current = 1, pageSize = 10 }) => {
    loadData(current, pageSize);
  };

  const columns = [
    {
      title: '数据需求方',
      dataIndex: 'applier_name',
    },
    {
      title: '交易哈希',
      dataIndex: 'tx_hash',
      ellipsis: {
        showTitle: false,
      },
      render: text => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '区块哈希',
      dataIndex: 'blk_hash',
      ellipsis: {
        showTitle: false,
      },
      render: text => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '数据获取时间',
      dataIndex: 'obtained_time',
      render: val => formatTime(val),
    },
  ];

  const handleTabsChange = key => {
    if (key === '2') {
      loadData();
    }
  };

  return (
    <div className={`${styles.dataDesc} container-card`}>
      <Tabs onChange={handleTabsChange}>
        <Tabs.TabPane tab="数据元信息" key="0">
          <div className={styles.box}></div>
          <div style={{ margin: '0 32px' }}>
            <div>
              <Descriptions column={2} style={{ marginLeft: -12 }}>
                <Descriptions.Item label="数据标题">{dataDetail.data_name}</Descriptions.Item>
                <Descriptions.Item label="所属机构">{dataDetail.org_name}</Descriptions.Item>
                <Descriptions.Item label="数据类型">
                  {DATA_TYPE_TEXT[dataDetail.data_type]}
                </Descriptions.Item>
                <Descriptions.Item label="机构节点">{dataDetail.org_node}</Descriptions.Item>
                <Descriptions.Item label="数据主题">
                  {(dataDetail.data_topics || []).map(item => (
                    <span style={{ marginRight: 8 }}>{DATA_THEME[item].value}</span>
                  ))}
                </Descriptions.Item>
                {dataDetail.data_type === 3 ? (
                  <>
                    <Descriptions.Item label="使用限制">
                      {PRIVATE_TYPE_LIST[dataDetail.is_private || 'false']}
                    </Descriptions.Item>
                    <Descriptions.Item label="是否审核">
                      {dataDetail.need_approval ? '是' : '否'}
                    </Descriptions.Item>
                    {dataDetail.need_approval ? (
                      <Descriptions.Item label="审核内容">
                        {APPROVE_CONTENT[dataDetail.approve_content || 0]}
                      </Descriptions.Item>
                    ) : null}
                  </>
                ) : null}
                <Descriptions.Item label="共享类型">
                  {getOrderType(dataDetail.order_type)}
                </Descriptions.Item>
                <Descriptions.Item label="发布时间">
                  {formatTime(dataDetail.update_time)}
                </Descriptions.Item>
                <Descriptions.Item label="数据描述">{dataDetail.data_desc}</Descriptions.Item>
              </Descriptions>
              {dataDetail.data_type === 1 ? <InterfaceDetail info={dataDetail} /> : null}
              {dataDetail.data_type === 2 ? <ModelDetail info={dataDetail} /> : null}
              {dataDetail.data_type === 3 ? <OriginDetail info={dataDetail} /> : null}
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="链上信息" key="1">
          <div className={styles.box}></div>
          <div style={{ margin: '0 32px' }}>
            <Alert
              type="info"
              message="数据仅发布元信息，以下为上链的信息。"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ padding: 0 }}>
              <Descriptions>
                <Descriptions.Item label="数据哈希">
                  {dataDetail.data_hash || dataDetail.data_id}
                </Descriptions.Item>
                <Descriptions.Item label="发布哈希">{dataDetail.tx_hash}</Descriptions.Item>
                <Descriptions.Item label="区块哈希">{dataDetail.blk_hash}</Descriptions.Item>
                <Descriptions.Item label="区块高度">{dataDetail.blk_height}</Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <>
              <span style={{ marginRight: 12 }}>共享记录</span>
              <Tag bordered color="processing">
                上链
              </Tag>
            </>
          }
          key="2"
        >
          <div className={styles.box}></div>
          <div style={{ margin: '0 32px' }}>
            <Alert type="info" message="数据共享会在区块链上记录" showIcon />
            <div className={styles.note}>
              <Descriptions labelStyle={{ width: 104 }}>
                <Descriptions.Item label="数据来源机构">{dataDetail.org_name}</Descriptions.Item>
                <Descriptions.Item label="数据哈希">
                  {dataDetail.data_hash || dataDetail.data_id}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Table
              columns={columns}
              dataSource={txRecordList.list}
              onChange={onChange}
              pagination={{
                total: txRecordList.total,
                pageSize: pSize,
                current: currentPage,
                showQuickJumper: true,
              }}
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default connect()(DataDesc);
