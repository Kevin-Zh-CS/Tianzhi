import React from 'react';
import { Table, Tooltip } from 'quanta-design';

const ParamTable = props => {
  const { list } = props;

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: text => (
        <Tooltip title={text}>
          <div className="columnItem">{text || '-'}</div>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: text => <div className="columnItem">{text || '-'}</div>,
    },
    {
      title: '示例值',
      dataIndex: 'example',
      render: text => (
        <Tooltip title={text}>
          <div className="columnItem">{text || '-'}</div>
        </Tooltip>
      ),
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render: text => (
        <Tooltip title={text}>
          <div className="columnItem">{text || '-'}</div>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      showSorterTooltip={false}
      columns={columns}
      // dataSource={[...list]}
      dataSource={list}
      pagination={false}
      emptyTableText="无参数"
    />
  );
};

export default ParamTable;
