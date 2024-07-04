import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import ResultOverview from '../ResultOverview';
import RiskTable from "@/pages/Federate/Application/RiskControl/components/RiskTable";
import './index.less';

const ResultDetail = props => {
  const {
    dispatch,
    taskId,
    jobId,
    resultDetail,
    resultDetailList,
    total,
  } = props;

  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isEmpty, setIsEmpty] = useState(true)

  const getResultDetailInfo = (page, size) => {
    dispatch({
      type: 'riskControl/resultDetailInfo',
      payload: {
        task_id: taskId,
        job_id: jobId,
        page,
        size,
      },
      callback: () => setIsEmpty(false)
    });
  }

  useEffect(() => {
    if (jobId) {
      dispatch({
        type: 'riskControl/resultDetail',
        payload: {
          task_id: taskId,
          job_id: jobId,
        },
      });
      getResultDetailInfo(1, 5);
    }
  }, [jobId]);

  const onTableChange = pagination => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
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
    <div className="resultDetail">
      <div className="top">
        <div className="title">
          {resultDetail.task_type === 1 ? (
            <>
              <i className="iconfont iconxian1"/>
              <span>一人多企</span>
            </>
          ) : (
            <>
              <i className="iconfont iconxian"/>
              <span>短期内频繁开户</span>
            </>
          )}
        </div>
        <div className="infoItem hash">
          <span>查询哈希：</span>
          <span>{resultDetail.query_hash}</span>
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
      <ResultOverview num={resultDetail.risk_num}/>
      <div className="record">
        <div className="badgeTitle">
          风险详细信息
        </div>
        <RiskTable
          columns={resultDetail.task_type ? businessColumns : accountColumns}
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
        />
      </div>
    </div>
  )
}

export default connect(({ riskControl }) => ({
  resultDetail: riskControl.resultDetail,
  resultDetailList: riskControl.resultDetailInfo[riskControl.resultDetail.task_type ? "business_risk_list" : "account_risk_list"],
  total: riskControl.resultDetailInfo.total,
  jobId: riskControl.modalInfo.jobId,
  taskId: riskControl.modalInfo.taskId,
}))(ResultDetail);
