import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal } from 'quanta-design';
import ResultOverview from '@/pages/Federate/Application/RiskControl/components/ResultOverview';
import RiskTable from '@/pages/Federate/Application/RiskControl/components/RiskTable';
import './index.less';

const SingleDetailModal = props => {
  const {
    dispatch,
    visible,
    handleToggleModal,
    taskId,
    jobId,
    taskDetail,
    resultDetail,
    resultDetailList,
    total,
    loading,
  } = props;
  const PERIOD_TYPE = ['日', '个月', '年'];
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isEmpty, setIsEmpty] = useState(true);

  const getResultDetailInfo = (page, size) => {
    dispatch({
      type: 'riskControl/resultDetailInfo',
      payload: {
        task_id: taskId,
        job_id: jobId,
        page,
        size,
      },
      callback: () => setIsEmpty(false),
    });
  };

  useEffect(() => {
    dispatch({
      type: 'riskControl/taskDetail',
      payload: {
        task_id: taskId,
      },
    });
    dispatch({
      type: 'riskControl/resultDetail',
      payload: {
        task_id: taskId,
        job_id: jobId,
      },
    });
    getResultDetailInfo(1, 5);
  }, []);

  const handleCancel = () => {
    handleToggleModal({
      singleVisible: false,
    });
  };

  const onTableChange = pagination => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
    getResultDetailInfo(pagination.current, pagination.pageSize);
  };

  const businessColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <span>{index + 1 + (current - 1) * pageSize}</span>,
    },
    {
      title: '身份证号',
      dataIndex: 'account_id',
      key: 'account_id',
    },
    {
      title: '法人/负责人',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: '企业数量',
      dataIndex: 'business_num',
      key: 'business_num',
    },
    {
      title: '开户银行',
      dataIndex: 'account_bank',
      key: 'account_bank',
    },
    {
      title: '企业名称',
      dataIndex: 'business_name',
      key: 'business_name',
    },
  ];

  const accountColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => <span>{index + 1 + (current - 1) * pageSize}</span>,
    },
    {
      title: '身份证号',
      dataIndex: 'account_id',
      key: 'account_id',
    },
    {
      title: '账户名称',
      dataIndex: 'account_name',
      key: 'account_name',
    },
    {
      title: '开户数量',
      dataIndex: 'account_num',
      key: 'account_num',
    },
    {
      title: '开户银行',
      dataIndex: 'account_bank',
      key: 'account_bank',
    },
    {
      title: '开户日期',
      dataIndex: 'account_date',
      key: 'account_date',
    },
  ];

  return (
    <Modal
      title="任务详情"
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      wrapClassName="riskDetailModal singleDetailModal"
      getContainer={() => document.getElementById('riskControlBox')}
    >
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
        <div className="infoItem hash">
          <span>查询哈希：</span>
          <span>{resultDetail.query_hash}</span>
        </div>
      </div>
      <div className="info info1">
        <div className="infoItem">
          <span>预警阈值：</span>
          <span>{`>=${taskDetail.threshold}`}</span>
        </div>
        <div className="infoItem">
          <span>执行方式：</span>
          <span>{taskDetail.execute_type === 0 ? '单次执行' : '循环执行'}</span>
        </div>
        <div className="infoItem">
          <span>时间范围：</span>
          <span>{`${taskDetail.period_time}${PERIOD_TYPE[taskDetail.period_type]}`}</span>
        </div>
      </div>
      <div className="info">
        <div className="infoItem">
          <span>查询耗时：</span>
          <span>{`${resultDetail.used_time}ms`}</span>
        </div>
        <div className="infoItem">
          <span>完成时间：</span>
          <span>{moment(resultDetail.finish_time).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      </div>
      <ResultOverview num={taskDetail.risk_num} />
      <div className="record">
        <div className="badgeTitle">风险详细信息</div>
        <RiskTable
          columns={taskDetail.task_type ? businessColumns : accountColumns}
          dataSource={resultDetailList}
          isEmpty={isEmpty}
          onChange={onTableChange}
          rowKey="account_id"
          pagination={{
            total,
            simple: true,
            current,
            pageSize,
          }}
          loading={{
            spinning: loading,
          }}
        />
      </div>
    </Modal>
  );
};

export default connect(({ riskControl, loading }) => ({
  taskDetail: riskControl.taskDetail,
  resultDetail: riskControl.resultDetail,
  resultDetailList:
    riskControl.resultDetailInfo[
      riskControl.taskDetail.task_type ? 'business_risk_list' : 'account_risk_list'
    ],
  total: riskControl.resultDetailInfo.total,
  jobId: riskControl.modalInfo.jobId,
  taskId: riskControl.modalInfo.taskId,
  visible: riskControl.modalInfo.singleVisible,
  loading: loading.effects['riskControl/resultDetailInfo'],
}))(SingleDetailModal);
