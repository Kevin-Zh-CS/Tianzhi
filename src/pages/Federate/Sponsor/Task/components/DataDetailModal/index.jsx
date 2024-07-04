import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Divider, Table, Pagination } from 'quanta-design';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import {
  PRIVATE_TYPE,
  DATA_JOIN_TYPE,
  DATA_TYPE_TEXT,
  DATA_MODEL_STATE,
  APPROVE_CONTENT,
} from '@/utils/enums';
import OrderStatus from '@/components/OrderStatus';
import styles from './index.less';
import { DATA_THEME } from '@/pages/Manage/Outer/config';
// import { ReactComponent as EmptyIcon } from '@/icons/empty-image.svg';
import ParamTable from '@/pages/Manage/component/ParamTable';
import CodeEditor from '@/components/CodeEditor';
import { getLists } from '@/services/importer';
import { getOrderType } from '@/pages/Share/Platform/config';

const { Panel } = Collapse;

function DataDetailModal(props) {
  const {
    visible,
    onCancel,
    status = 0,
    data_name: dataName = '',
    format_desc: formatDesc = '',
    // dataHash = '',
    data_type: resourceType = '',
    // dataSize = '',
    org_name: orgName = '',
    participant_id: address = '',
    is_private: isPrivate = 0,
    // dataCount = '',
    initiator_data_type: dataType = '',
    // data_meta: dataMeta = [],
    require_format: formatMeta = [],
    // invite_data_meta: inviteDataMeta = [],
    refuse_invite_reason: reason = '',
    need_approval,
    approve_content,
    isSponsor,
    namespace_id,
    args,
    dataTypes,
    data_id,
  } = props;
  const [list, setList] = useState({});
  const [pages, setPage] = useState(1);

  const methods =
    args && typeof props.args === 'string'
      ? JSON.parse(args)
      : typeof props.args === 'object'
      ? args
      : resourceType === 2
      ? []
      : {};
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);
  const [loading, setLoading] = useState(false);
  let columns = [];

  if (list.records && list.records.length > 0) {
    const tmp = Object.keys(list.records[0]);
    columns = tmp.map(obj => {
      const item = {
        title: obj,
        dataIndex: obj,
        key: obj,
      };
      return item;
    });
  }

  const getActiveKey = () => {
    const activeKeys = [];
    if (methods.headers && JSON.stringify(methods.headers) !== '{}') {
      activeKeys.push('0');
    }
    if (methods.body && JSON.stringify(methods.body) !== '{}') {
      activeKeys.push('1');
    }
    if (methods.queries && JSON.stringify(methods.queries) !== '{}') {
      activeKeys.push('2');
    }
    setDefaultActiveKey(activeKeys);
  };

  useEffect(() => {
    getActiveKey();
  }, []);

  const handlePanelChange = e => {
    setDefaultActiveKey(e);
  };

  const getTopicsStr = function(topics) {
    return (topics || []).map(item => (
      <span style={{ marginRight: 8 }} key={item.key}>
        {DATA_THEME[item].value}
      </span>
    ));
  };

  const getData = async (page = 1, size = 10) => {
    setLoading(true);
    const data = await getLists({ page, size, namespace: namespace_id, data_id });
    setLoading(false);
    setPage(page);
    setList(data);
  };

  useEffect(() => {
    if (visible && namespace_id && dataTypes === DATA_JOIN_TYPE.LOCAL_IMPORT) {
      getData();
    }
  }, [visible, namespace_id]);

  const handleChange = (current, pageSize) => {
    getData(current, pageSize);
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      style={{ minWidth: 888 }}
      title={
        status === DATA_MODEL_STATE.DATA_WAIT_ACCEPT || status === DATA_MODEL_STATE.DATA_REJECT
          ? '邀请详情'
          : '数据详情'
      }
      footer={null}
      visible={visible}
      onCancel={onCancel}
    >
      {status === DATA_MODEL_STATE.DATA_WAIT_ACCEPT || status === DATA_MODEL_STATE.DATA_REJECT ? (
        <>
          {status === DATA_MODEL_STATE.DATA_WAIT_ACCEPT && (
            <OrderStatus
              status={0}
              title="待接受"
              desc="需参与方对任务邀请进行确认，接受邀请后并添加数据，发起方才能使用该数据。"
            />
          )}
          {status === DATA_MODEL_STATE.DATA_REJECT && (
            <OrderStatus
              status={1}
              title="已拒绝"
              desc={
                <span>
                  参与方已拒绝您的邀请。
                  <br />
                  拒绝理由：{reason}
                </span>
              }
            />
          )}
          <Descriptions title="参与方信息" style={{ marginTop: 20 }}>
            <Descriptions.Item label="参与方机构">{orgName}</Descriptions.Item>
            <Descriptions.Item label="参与方地址">{address}</Descriptions.Item>
          </Descriptions>
          <Divider dashed />
          <Descriptions title="数据格式" labelStyle={{ width: 104 }}>
            <Descriptions.Item label="所需数据名称">{dataName}</Descriptions.Item>
            <Descriptions.Item label="格式说明">{formatDesc}</Descriptions.Item>
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
                dataSource={formatMeta}
                pagination={false}
              />
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Descriptions column={2}>
          {/* <Descriptions.Item label="共享类型">{PUBLISH_TYPE_TEXT[isAuth]}</Descriptions.Item> */}
          {dataType === DATA_JOIN_TYPE.LOCAL_APPKEY && (
            <>
              <Descriptions.Item label="数据名称" span={2}>
                {dataName}
              </Descriptions.Item>
              {/* <Descriptions.Item label="数据哈希">{dataHash}</Descriptions.Item> */}
              <Descriptions.Item label="数据类型" span={2}>
                {DATA_TYPE_TEXT[resourceType] || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属机构" span={2}>
                {orgName}
              </Descriptions.Item>
              <Descriptions.Item label="数据描述" span={2}>
                {props.data_desc || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数据主题" span={2}>
                {getTopicsStr(props.data_topics) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用限制" span={2}>
                {PRIVATE_TYPE[isPrivate ? 1 : 0]}
              </Descriptions.Item>
              {resourceType === 3 ? (
                <>
                  <Descriptions.Item label="是否审核" span={need_approval ? 1 : 2}>
                    {need_approval ? '是' : '否'}
                  </Descriptions.Item>
                  {need_approval ? (
                    <Descriptions.Item label="审核内容" span={1}>
                      {APPROVE_CONTENT[approve_content || 0]}
                    </Descriptions.Item>
                  ) : null}
                </>
              ) : null}
              <Descriptions.Item label="共享类型" span={2}>
                {getOrderType(props.order_type)}
              </Descriptions.Item>
              {resourceType === 1 && (
                <>
                  <Descriptions.Item label="输入参数" span={2}>
                    <Collapse
                      expandIcon={({ isActive }) => (
                        <CaretRightOutlined rotate={isActive ? 90 : 0} />
                      )}
                      activeKey={defaultActiveKey}
                      onChange={handlePanelChange}
                    >
                      <Panel key="0" header="请求参数（Headers）" className={styles.luaPanel}>
                        <div className={styles.paramTable}>
                          <div>
                            <div className={styles.intro}>使用说明</div>
                            <div style={{ marginBottom: 10 }}>
                              {(methods.headers && methods.headers.desc) || '-'}
                            </div>
                          </div>
                          <div className={styles.intro}>参数详情</div>
                          <div className={styles.paramTable}>
                            <ParamTable list={methods.headers?.headers || []} />
                          </div>
                        </div>
                      </Panel>
                      <Panel key="1" header="请求参数（Query）" className={styles.luaPanel}>
                        <div className={styles.paramTable}>
                          <div>
                            <div className={styles.intro}>使用说明</div>
                            <div style={{ marginBottom: 10 }}>
                              {(methods.queries && methods.queries.desc) || '-'}
                            </div>
                          </div>
                          <div className={styles.intro}>参数详情</div>
                          <div className={styles.paramTable}>
                            <ParamTable list={methods.queries?.query_strings || []} />
                          </div>
                        </div>
                      </Panel>
                      <Panel key="2" header="请求参数（Body）" className={styles.luaPanel}>
                        <div className={styles.paramTable}>
                          <div>
                            <div className={styles.intro}>使用说明</div>
                            <div style={{ marginBottom: 10 }}>
                              {(methods.body && methods.body.desc) || '-'}
                            </div>
                          </div>
                          <div className={styles.codeWrap}>
                            <div className={styles.intro}>参数详情</div>
                            <CodeEditor
                              value={(methods.body && methods.body.body) || '-'}
                              readOnly
                            />
                          </div>
                        </div>
                      </Panel>
                    </Collapse>
                  </Descriptions.Item>
                  <Descriptions.Item label="输出参数" span={2}>
                    <div className={styles.paramTable}>
                      <ParamTable list={methods.rets?.req_response || []} />
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="请求示例" span={2}>
                    <div className={styles.paramTable} style={{ marginTop: 0 }}>
                      <CodeEditor
                        mode="json"
                        value={methods.example}
                        placeholder="请输入正确的请求示例，可以点击“生成请求示例”自动生成示例"
                      />
                    </div>
                  </Descriptions.Item>
                </>
              )}
              {resourceType === 2 && (
                <Descriptions.Item label="参数信息" span={2}>
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
                            <ParamTable list={item.outputs || []} />
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
              )}
              {resourceType === 3 && (
                <Descriptions.Item label="数据参数" span={2}>
                  <Collapse
                    defaultActiveKey="1"
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className={styles.collpase}
                  >
                    <Collapse.Panel header="数据字段" key="1">
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
                        dataSource={methods.fields}
                        pagination={false}
                      />
                    </Collapse.Panel>
                  </Collapse>
                </Descriptions.Item>
              )}
            </>
          )}
          {dataType === DATA_JOIN_TYPE.INVITED && (
            <>
              <Descriptions.Item label="数据名称" span={2}>
                {props.data_name}
              </Descriptions.Item>
              <Descriptions.Item label="所属机构" span={2}>
                {props.org_name}
              </Descriptions.Item>
              <Descriptions.Item label="格式说明" span={2}>
                {formatDesc}
              </Descriptions.Item>
              <Descriptions.Item label="使用限制" span={2}>
                {PRIVATE_TYPE[isPrivate ? 1 : 0]}
              </Descriptions.Item>
              <Descriptions.Item label="是否审核" span={props.is_need_approval ? 1 : 2}>
                {props.is_need_approval ? '是' : '否'}
              </Descriptions.Item>
              {props.is_need_approval ? (
                <Descriptions.Item label="审核内容" span={1}>
                  {props.approve_content !== null
                    ? APPROVE_CONTENT[props.approve_content || 0]
                    : '-'}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="数据参数" span={2}>
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
                  dataSource={formatMeta}
                  pagination={false}
                />
              </Descriptions.Item>
            </>
          )}
          {dataType === DATA_JOIN_TYPE.LOCAL_IMPORT && (
            <>
              <Descriptions.Item label="数据名称" span={2}>
                {props.data_name}
              </Descriptions.Item>
              <Descriptions.Item label="数据类型" span={2}>
                {isSponsor ? '本地数据' : DATA_TYPE_TEXT[props.data_type]}
              </Descriptions.Item>
              <Descriptions.Item label="所属机构" span={2}>
                {props.org_name}
              </Descriptions.Item>
              <Descriptions.Item label="数据描述" span={2}>
                {props.desc}
              </Descriptions.Item>
              <Descriptions.Item label="数据内容" span={2}>
                共{list.total}条数据
              </Descriptions.Item>
              <Descriptions.Item label="" style={{ paddingBottom: 8, paddingLeft: 78 }} span={2}>
                <div className="overflowTable">
                  <Table
                    columns={columns}
                    dataSource={list.records || []}
                    pagination={false}
                    loading={{
                      spinning: loading,
                    }}
                  />
                  <div className="overflowPagination">
                    <Pagination total={list.total} current={pages} onChange={handleChange} />
                  </div>
                </div>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      )}
    </Modal>
  );
}

export default DataDetailModal;
