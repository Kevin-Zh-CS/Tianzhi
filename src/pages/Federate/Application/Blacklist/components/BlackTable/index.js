import React from 'react';
import { Table } from 'quanta-design';
import classnames from 'classnames';
import emptyTable from '@/assets/blacklist/emptyTable.png';
import styles from './index.less';

const BlackTable = props => {
  const {
    className = '',
    columns,
    dataSource,
    small = false,
    style,
    pagination,
    onChange,
    loading,
  } = props;

  let cn = classnames(className, styles.blackTable);
  if (small) {
    cn = classnames(className, styles.small, styles.blackTable);
  }

  const EmptyText = () => (
    <div className={styles.emptyBox}>
      <img alt="" src={emptyTable} />
      <span>暂无内容</span>
    </div>
  );
  const locale = {
    emptyText: <EmptyText />,
  };

  return (
    <Table
      onChange={onChange}
      showSorterTooltip={false}
      className={cn}
      columns={columns}
      dataSource={dataSource}
      rowKey={record => record.key}
      locale={locale}
      pagination={pagination}
      style={style}
      loading={loading || false}
    />
  );
};
export default BlackTable;
