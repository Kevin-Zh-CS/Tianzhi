import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Modal, Switch, Button } from 'quanta-design';
import moment from 'moment';
import RiskTable from '../RiskTable';
import ResultDetail from '../ResultDetail';
import styles from './index.less';

const LoopDetailModal = props => {
  const {
    dispatch,
    taskQueue,
    visible,
    handleToggleModal,
    taskDetail,
    taskDetailList,
    taskId,
    total,
    tab,
    loading,
  } = props;
  const PERIOD_TYPE = ['日', '个月', '年'];
  const [isEmpty, setIsEmpty] = useState(true);

  const getTaskDetailInfo = (page, size, is_asc) => {
    dispatch({
      type: 'riskControl/taskDetailInfo',
      payload: {
        task_id: taskId,
        page,
        size,
        is_asc: is_asc === 'ascend',
      },
      callback: () => setIsEmpty(false),
    });
  };

  useEffect(() => {
    if (tab === 'taskDetail') {
      dispatch({
        type: 'riskControl/taskDetail',
        payload: {
          task_id: taskId,
        },
        callback: res => {
          if (res.query_num) getTaskDetailInfo(1, 5, false);
        },
      });
    }
  }, [tab]);

  const handleCancel = () => {
    handleToggleModal({
      loopVisible: false,
    });
  };

  const onStatusChange = () => {
    dispatch({
      type: 'riskControl/taskStatus',
      payload: {
        task_id: taskId,
        is_open: taskDetail.is_open ? 0 : 1,
      },
      callback: () => {
        dispatch({
          type: 'riskControl/taskDetail',
          payload: {
            task_id: taskId,
          },
        });
        dispatch({
          type: 'riskControl/taskQueue',
          payload: {
            page: 1,
            size: taskQueue.length,
            isUpdate: true,
          },
        });
      },
    });
  };

  const handleToggleTab = (_tab, job_id) => {
    if (job_id)
      dispatch({
        type: 'riskControl/saveModalInfo',
        payload: {
          jobId: job_id,
          tab: _tab,
        },
      });
  };

  const columns = [
    {
      title: '查询哈希',
      dataIndex: 'query_hash',
      key: 'query_hash',
      render: text => <div className={styles.hash}>{text}</div>,
    },
    {
      title: '数据使用量',
      dataIndex: 'data_usage',
      key: 'data_usage',
      render: text => <span>{`${text} 条`}</span>,
    },
    {
      title: '风险数量',
      dataIndex: 'risk_num',
      key: 'risk_num',
      render: text => <span>{`${text} 条`}</span>,
    },
    {
      title: '查询耗时',
      dataIndex: 'used_time',
      key: 'used_time',
      render: text => <span>{`${text} ms`}</span>,
    },
    {
      title: '完成时间',
      dataIndex: 'finish_time',
      key: 'finish_time',
      sorter: () => {},
      render: text => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '查询结果',
      dataIndex: 'job_id',
      key: 'job_id',
      render: text => (
        <Button type="text" onClick={() => handleToggleTab('resultDetail', text)}>
          查看详情
        </Button>
      ),
    },
  ];

  const onTableChange = (pagination, filters, sorter) => {
    getTaskDetailInfo(pagination.current, pagination.pageSize, sorter.order);
  };

  const modalTitle =
    tab === 'taskDetail' ? (
      <span>任务详情</span>
    ) : (
      <div>
        <span
          className="link"
          onClick={() =>
            dispatch({
              type: 'riskControl/saveModalInfo',
              payload: {
                tab: 'taskDetail',
              },
            })
          }
        >
          任务详情
        </span>
        <i className="iconfont iconxfangxiangxing_danxianjiantou_you" />
        <span>查询结果详情</span>
      </div>
    );

  return (
    <Modal
      title={modalTitle}
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      wrapClassName="riskDetailModal loopDetailModal"
      getContainer={() => document.getElementById('riskControlBox')}
    >
      {tab === 'taskDetail' ? (
        <div className="taskDetail">
          <div className="top">
            <div className="title">
              {taskDetail.task_type === 1 ? (
                <>
                  <i className="iconfont iconxian1" />
                  <span>一人多企</span>
                </>
              ) : (
                <>
                  <i className="iconfont iconxian" />
                  <span>短期内频繁开户</span>
                </>
              )}
            </div>
            <div className="status">
              <span>任务状态：</span>
              <Switch
                checked={taskDetail.is_open}
                onChange={onStatusChange}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </div>
          </div>
          <div className="info">
            <div className="infoItem">
              <span>预警阈值：</span>
              <span>{`>=${taskDetail.threshold}`}</span>
            </div>
            <div className="infoItem">
              <span>执行方式：</span>
              <span>{taskDetail.execute_type === 0 ? '单次执行' : '循环执行'}</span>
            </div>
            <div className="infoItem">
              <span>执行周期：</span>
              <span>{`${taskDetail.cycle_time}${PERIOD_TYPE[taskDetail.period_type]}`}</span>
            </div>
            <div className="infoItem">
              <span>开始时间：</span>
              <span>{moment(taskDetail.begin_time).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </div>
          <div className="record">
            <div className="badgeTitle">历史查询记录</div>
            <div className="queryNum">
              <div>查询总次数：</div>
              <div className="right">
                <span>{taskDetail.query_num?.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',')}</span>
                <span>次</span>
              </div>
            </div>
            <RiskTable
              columns={columns}
              dataSource={taskDetailList}
              isEmpty={isEmpty}
              onChange={onTableChange}
              rowKey="job_id"
              pagination={{
                total,
                simple: true,
                pageSize: 5,
              }}
              loading={{
                spinning: loading,
              }}
            />
          </div>
        </div>
      ) : (
        <ResultDetail />
      )}
    </Modal>
  );
};

export default connect(({ riskControl, loading }) => ({
  taskQueue: riskControl.taskQueue,
  taskDetail: riskControl.taskDetail,
  taskDetailList: riskControl.taskDetailInfo.list,
  total: riskControl.taskDetailInfo.total,
  taskId: riskControl.modalInfo.taskId,
  visible: riskControl.modalInfo.loopVisible,
  tab: riskControl.modalInfo.tab,
  loading: loading.effects['riskControl/taskDetailInfo'],
}))(LoopDetailModal);
