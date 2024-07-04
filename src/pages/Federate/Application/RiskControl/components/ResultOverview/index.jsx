import React from 'react';
import './index.less';

const ResultOverview = props => {
  const { num } = props;

  return (
    <div className="resultOverview">
      <div className="badgeTitle">
        查询结果概览
      </div>
      <div className="data">
        <div>查询结果</div>
        <div className="riskNum">
          <span>风险数量：<span className="num">{String(num || 0).replace(/\B(?=(?:\d{3})+\b)/g, ',')}</span> 条</span>
        </div>
      </div>
    </div>
  )
}

export default ResultOverview
