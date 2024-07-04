import React from 'react';
import { Table } from 'quanta-design';
import classnames from 'classnames';
import emptyTable from '@/assets/blacklist/emptyTable.png';
import styles from './index.less';

const RiskTable = props => {
  const {
    className = '',
    columns,
    dataSource,
    style,
    pagination,
    onChange,
    rowKey,
    isEmpty,
    loading,
  } = props;

  const cn = classnames(className, 'riskTable');

  const EmptyText = () => (
    <div className={styles.emptyBox}>
      <img alt="" src={emptyTable} />
      <span>{isEmpty ? '暂无查询结果' : '无风险数据'}</span>
    </div>
  );
  const locale = {
    emptyText: <EmptyText />,
  };

  return (
    <Table
      defaultPageSize={5}
      className={cn}
      style={style}
      onChange={onChange}
      showSorterTooltip={false}
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      locale={locale}
      pagination={pagination}
      loading={loading || false}
    />
  );
};
export default RiskTable;
