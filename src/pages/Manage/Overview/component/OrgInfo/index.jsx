import React from 'react';
// import { Row, Col } from 'quanta-design';
import { Table } from 'quanta-design';
import ItemTitle from '@/components/ItemTitle';
import styles from './index.less';

const columns = [
  { title: '数据名称', dataIndex: 'name' },
  { title: '操作人', dataIndex: 'user' },
  { title: '发布时间', dataIndex: 'created_time' },
];
const dataSource = [
  {
    name: '数据共享文件数据共享…',
    user: '张大三',
    created_time: '2020-09-14 12:20:20',
  },
  {
    name: '数据共享文件数据共享…',
    user: '李四',
    created_time: '2020-09-14 12:20:20',
  },
  {
    name: '数据共享文件数据共享…',
    user: '王五',
    created_time: '2020-09-14 12:20:20',
  },
  {
    name: '数据共享文件数据共享…',
    user: '张大三',
    created_time: '2020-09-14 12:20:20',
  },
  {
    name: '数据共享文件数据共享…',
    user: '李四',
    created_time: '2020-09-14 12:20:20',
  },
];

class OrgInfo extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { title } = this.props;
    return (
      <div className={styles.serverInfoWrap}>
        <ItemTitle title={title} />
        <Table
          rowKey="chain_code"
          // className={styles.tableServer}
          columns={columns}
          dataSource={dataSource}
          pagination={{ total: 5, hideOnSinglePage: true }}
          // onChange={this.handlePageChange}
          // loading={loading['server/getList']}
          emptyTableText={<div style={{ color: '#888888' }}>暂无数据</div>}
        />
      </div>
    );
  }
}

export default OrgInfo;
