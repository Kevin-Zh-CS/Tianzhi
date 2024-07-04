import React, { useEffect, useState } from 'react';
import { Alert, Icons, Button, Table, IconBase, Popover, message, Tooltip } from 'quanta-design';
import { connect } from 'dva';
import { router } from 'umi';
import { DATA_RESOURCE_TEXT, PERMISSION } from '@/utils/enums.js';
import { formatTime } from '@/utils/helper';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import Step from '../../component/Step';
import styles from './index.less';
import useAuth from '@/pages/Manage/Inner/component/useAuth';

const { QuestionCircleIcon } = Icons;

const Context = ({ text = '', onOk = null, onCancel = null }) => (
  <div
    style={{
      padding: 8,
      width: 248,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <p style={{ display: 'flex', alignItems: 'center', color: '#121212', fontSize: 14 }}>
      <QuestionCircleIcon style={{ marginRight: 8 }} fill="#0076D9" />
      {text}
    </p>
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
      <Button onClick={onCancel} size="small" type="link" style={{ marginRight: 6 }}>
        取消
      </Button>
      <Button onClick={onOk} size="small" type="primary">
        确定
      </Button>
    </div>
  </div>
);

function Import(props) {
  const { location, dispatch, dataList = [], loading } = props;
  const namespace = location.query.namespace.toString();
  const { PlusIcon } = Icons;
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [showIndex, setShowIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(true);

  const auth = useAuth({ ns_id: location.query.namespace });

  const stepData = [
    {
      title: '创建资源库',
      content: '为不同类型事务创建资源库，方便管理本地资源',
    },
    {
      title: '上传/关联数据',
      content: '上传本地CSV文件/直接关联当前资源库连接的数据库',
    },
    {
      title: '保存数据',
      content: '确认数据内容后保存',
    },
  ];

  const stepCurrent = 2;

  const handleRefresh = async (e = {}, _, sorter = {}) => {
    const { current = 1, pageSize = 10 } = e;
    setCurrentPage(current);
    const res = await dispatch({
      type: 'importer/dataList',
      payload: {
        isTimeDesc: sorter.order === 'descend',
        page: current,
        size: pageSize,
        namespace,
      },
    });
    return res.total === 0;
  };
  // const refresh = () => {
  //   handlRefresh();
  //   setCurrentPage(1);
  // };

  useEffect(() => {
    handleRefresh().then(_showAlert => setShowAlert(_showAlert));
  }, []);

  const columns = [
    {
      title: '数据名称',
      dataIndex: 'name',
    },
    {
      title: '数据来源',
      dataIndex: 'data_type',
      render: val => DATA_RESOURCE_TEXT[val],
      // is_import
    },
    {
      title: '所属数据库',
      dataIndex: 'db_name',
      render: val => (val !== null ? val : '-'),
    },
    {
      title: '关联任务数量',
      dataIndex: 'associate_task_num',
    },
    { title: '操作人', dataIndex: 'operator_name' },
    {
      title: '修改时间',
      dataIndex: 'updated_time',
      sorter: true,
      render: val => formatTime(val),
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, index) => (
        <>
          {
            <a
              onClick={() => {
                router.push(
                  `/manage/inner/repository/import/detail?namespace=${namespace}&dataId=${index.data_id}`,
                );
              }}
              style={{ marginRight: 24 }}
            >
              详情
            </a>
          }
          {!index.associate_task_num ? (
            <Popover
              visible={deleteVisible && showIndex === index}
              content={
                <Context
                  text="你确定要删除该所选数据吗?"
                  onCancel={() => {
                    setDeleteVisible(false);
                    setShowIndex(-1);
                  }}
                  onOk={() => {
                    const id = index.data_id.toString();
                    if (dispatch) {
                      dispatch({
                        type: 'importer/deleteData',
                        payload: {
                          namespace,
                          id,
                        },
                        callback: () => {
                          handleRefresh();
                          message.success('删除数据成功！');
                        },
                      });
                    }
                    setDeleteVisible(false);
                    setShowIndex(-1);
                  }}
                />
              }
            >
              <a
                onClick={() => {
                  setDeleteVisible(true);
                  setShowIndex(index);
                }}
                style={{ marginRight: 24 }}
              >
                删除
              </a>
            </Popover>
          ) : auth.includes(PERMISSION.del) ? (
            <Tooltip title="已关联任务的数据不支持删除！">
              <a style={{ marginRight: 24, color: '#B7B7B7' }}>删除</a>
            </Tooltip>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div>
      <Page
        title="数据导入"
        extra={
          <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
            数据导入使用说明{' '}
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
        alert={
          showAlert ? (
            <>
              <Alert
                type="info"
                message={
                  <span>
                    数据导入的功能定义：数据导入是统一管理库表结构的数据，支持上传本地CSV文件或直接关联当前资源库连接的数据库，作为隐私计算的数据准备等。
                  </span>
                }
                showIcon
                // closable
              />
              <Step stepData={stepData} current={stepCurrent} />
            </>
          ) : null
        }
        noContentLayout
      ></Page>
      <div className={styles.contentWrap}>
        {auth.includes(PERMISSION.create) && (
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            style={{ marginBottom: 14 }}
            onClick={() =>
              router.push(`/manage/inner/repository/import/upload?namespace=${namespace}`)
            }
          >
            导入数据
          </Button>
        )}
        {/* <Button icon={<RefreshIcon />} style={{ marginLeft: 12 }} onClick={refresh} /> */}

        <Table
          showSorterTooltip={false}
          columns={columns}
          dataSource={dataList.imported_data_list}
          onChange={handleRefresh}
          pagination={{
            current: currentPage,
            total: dataList.total,
          }}
          emptyTableText={<div style={{ color: '#888888' }}>暂无数据，快去上传/关联数据吧～</div>}
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </div>
  );
}

export default connect(({ importer, loading }) => ({
  dataList: importer.dataList,
  loading: loading.effects['importer/dataList'],
}))(Import);
