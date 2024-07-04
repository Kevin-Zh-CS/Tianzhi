import React, { useEffect, useState } from 'react';
import { Button, Table, Select, Descriptions, Form, Tooltip } from 'quanta-design';
import { connect } from 'dva';
import classnames from 'classnames';
import Page from '@/components/Page';
import router from 'umi/router';
import CreateModal from '../component/CreateModal';
import CreateOriginModal from '../component/CreateOriginModal';
import PublishRecordModal from '../component/PublishRecordModal';
import styles from './index.less';
import AddUser from '@/pages/Manage/component/AddUser';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import PermissionDenied from '@/pages/Manage/component/PermissionDenied';
import { PERMISSION } from '@/utils/enums';

function Detail(props) {
  const {
    dispatch,
    location,
    databaseDetail,
    tableList,
    columnList,
    tableDetailList,
    databaseRecords,
    style,
  } = props;

  const [visible, setVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  const [originVisible, setOriginVisible] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [colNameList, setColNameList] = useState([]);
  const [tableName, setTableName] = useState('');
  const [currentPage, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { namespace, dbHash } = location.query;

  const auth = useAuth({ ns_id: namespace, resource_id: dbHash });

  const fields = [];
  const columns = [];
  columnList.map(v => {
    columns.push({ key: v.name, dataIndex: v.name, title: v.name });
    fields.push(v.name);
    return false;
  });
  const [form] = Form.useForm();
  const dbTypeMap = {
    mysql: 'MySQL',
    mongo: 'MongoDB',
    postgres: 'PostgreSQL',
    oracle: 'Oracle',
  };

  const selectTable = v => {
    setColNameList([]);
    setCurrent(1);
    setPageSize(10);
    setTableName(v);
    form.setFieldsValue({ columList: [] });
    if (databaseDetail.db_type !== 'mongo') {
      dispatch({
        type: 'database/columnList',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
          tableName: v,
        },
        callback: () => {
          dispatch({
            type: 'database/tableDetailList',
            payload: {
              namespace: location.query.namespace,
              dbHash: location.query.dbHash,
              tableName: v,
            },
          });
        },
      });
    } else {
      dispatch({
        type: 'database/mongoList',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
          tableName: v,
        },
      });
    }
  };

  const publishDataSource = async () => {
    await form.validateFields();
    setOriginVisible(true);
  };

  const changePage = async e => {
    const { current = 1, pageSize: _pageSize } = e;
    setTableLoading(true);
    if (databaseDetail.db_type !== 'mongo') {
      await dispatch({
        type: 'database/tableDetailList',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
          tableName,
          page: current,
          size: _pageSize,
        },
      });
    } else {
      await dispatch({
        type: 'database/mongoList',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
          tableName,
          page: current,
          size: _pageSize,
        },
      });
    }
    setTableLoading(false);
    setCurrent(current);
    setPageSize(_pageSize);
  };
  useEffect(() => {
    if (auth.includes(PERMISSION.query) && dispatch) {
      dispatch({
        type: 'database/databaseDetail',
        payload: {
          namespace: location.query.namespace,
          dbHash: location.query.dbHash,
        },
        callback: _res => {
          dispatch({
            type: 'database/tableList',
            payload: {
              namespace: location.query.namespace,
              dbHash: location.query.dbHash,
              dbType: _res.db_type,
            },
            callback: res => {
              setTableName(res[0]);
              if (_res.db_type !== 'mongo') {
                dispatch({
                  type: 'database/columnList',
                  payload: {
                    namespace: location.query.namespace,
                    dbHash: location.query.dbHash,
                    tableName: res[0],
                  },
                  callback: () => {
                    dispatch({
                      type: 'database/tableDetailList',
                      payload: {
                        namespace: location.query.namespace,
                        dbHash: location.query.dbHash,
                        tableName: res[0],
                      },
                    });
                  },
                });
              } else {
                dispatch({
                  type: 'database/mongoList',
                  payload: {
                    namespace: location.query.namespace,
                    dbHash: location.query.dbHash,
                    tableName: res[0],
                  },
                });
              }
            },
          });
        },
      });
    }
  }, [auth]);

  return (
    <div>
      <Page
        title="数据库详情"
        showBackIcon
        noContentLayout
        extra={
          <div className={styles.btnWrap}>
            <AddUser namespace={namespace} resourceId={dbHash} auth={auth} />
            {auth.includes(PERMISSION.query) && (
              <Button onClick={() => setRecordVisible(true)} style={{ marginLeft: '8px' }}>
                查看已发布记录
              </Button>
            )}
          </div>
        }
      >
        {auth.includes(PERMISSION.query) ? (
          <div style={style}>
            <div className={styles.databaseInfoWrap}>
              {/* <div className={styles.infoItem}> */}
              <Descriptions column={2} labelStyle={{ width: 104 }} style={{ width: 1200 }}>
                <Descriptions.Item label="连接名称">{databaseDetail.conn_name}</Descriptions.Item>
                <Descriptions.Item label="IP地址">{databaseDetail.ip}</Descriptions.Item>
                <Descriptions.Item label="用户名">{databaseDetail.username}</Descriptions.Item>
                <Descriptions.Item label="数据库类型">
                  {dbTypeMap[databaseDetail.db_type]}
                </Descriptions.Item>
                <Descriptions.Item label="端口">{databaseDetail.port}</Descriptions.Item>
                <Descriptions.Item label="数据库名">{databaseDetail.db_name}</Descriptions.Item>
              </Descriptions>
            </div>
            <div className={styles.contentWrap}>
              <div className={styles.contentLeftWrap}>
                <div className={styles.title}>数据库表</div>
                <div mode="inline" style={{ marginTop: 20 }}>
                  {tableList.map(v => (
                    <Tooltip title={v}>
                      <div
                        className={classnames(
                          styles.tableName,
                          tableName === v ? styles.active : '',
                        )}
                        onClick={() => selectTable(v)}
                      >
                        {v}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className={styles.contentRightWrap}>
                <div className={styles.filterOpt}>
                  <Form form={form}>
                    <Form.Item
                      label="已选字段"
                      name="columList"
                      rules={[
                        {
                          required: true,
                          message: <span style={{ marginLeft: 20 }}>请选择字段内容</span>,
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder="请选择字段"
                        value={colNameList}
                        onChange={res => {
                          setColNameList(res);
                        }}
                        style={{ marginLeft: 20, width: 480 }}
                      >
                        {columnList.map(v => (
                          <Select.Option value={v.name}>{v.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                  {auth.includes(PERMISSION.usage) && (
                    <div>
                      <Button style={{ marginRight: 8 }} onClick={publishDataSource}>
                        生成数据源
                      </Button>
                      {/* <Button type="primary" disabled onClick={() => setVisible(true)}>
                  生成模型
                </Button> */}
                    </div>
                  )}
                </div>
                <div className={styles.tableWrap}>
                  <Table
                    columns={columns}
                    dataSource={tableDetailList.records}
                    onChange={changePage}
                    pagination={{
                      total: tableDetailList.total,
                      current: currentPage,
                      pageSize,
                    }}
                    emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
                    loading={{
                      spinning: tableLoading,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PermissionDenied />
        )}
      </Page>
      <CreateModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => {
          router.push(`/manage/inner/repository/model?namespace=${location.query.namespace}`);
        }}
      />
      <CreateOriginModal
        visible={originVisible}
        onCancel={() => setOriginVisible(false)}
        colNames={colNameList}
        namespace={location.query.namespace}
        dbHash={location.query.dbHash}
        dbName={databaseDetail.db_name}
        dbType={databaseDetail.db_type}
        tableName={tableName}
        onOk={() => {
          router.push(`/manage/inner/repository/origin?namespace=${location.query.namespace}`);
        }}
      />
      <PublishRecordModal
        visible={recordVisible}
        onCancel={() => setRecordVisible(false)}
        databaseRecords={databaseRecords}
        namespace={location.query.namespace}
        dbHash={location.query.dbHash}
      />
    </div>
  );
}

export default connect(({ database, loading, global }) => ({
  databaseDetail: database.databaseDetail,
  tableList: database.tableList,
  columnList: database.columnList,
  tableDetailList: database.tableDetailList,
  databaseRecords: database.databaseRecords,
  loading: loading.effects['database/databaseDetail'],
  loadingAuth: global.loadingAuth,
}))(Detail);
