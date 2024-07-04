import React from 'react';
import { Table, Descriptions } from 'quanta-design';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import styles from './index.less';

const DataDescTable = ({ dataSource = [], ...restProps }) => (
  <Table
    {...restProps}
    columns={[
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '示例值',
        dataIndex: 'example',
        key: 'example',
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
      },
    ]}
    dataSource={dataSource}
    pagination={false}
  />
);

function CollapseItem(props) {
  const { title = '', descTitle = '', descContent = '', children = null, ...restProps } = props;
  return (
    <Collapse
      {...restProps}
      defaultActiveKey="1"
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      className={styles.collpase}
    >
      <Collapse.Panel header={title} key="1">
        {descTitle && (
          <div className={styles.desc}>
            <span className={styles.title}>{descTitle}</span>
            <span className={styles.content}>{descContent}</span>
          </div>
        )}
        {children}
      </Collapse.Panel>
    </Collapse>
  );
}

function DataParams(props) {
  const {
    args = {}, // 数据参数
  } = props;
  const { fields = [], methods = [] } = args;
  return (
    <Descriptions className={styles.descriptions}>
      <Descriptions.Item label="数据参数">
        <CollapseItem title="数据字段">
          <DataDescTable dataSource={fields} />
        </CollapseItem>
        {methods.map(item => (
          <CollapseItem
            title={item.name}
            descTitle="使用说明"
            descContent={item.desc}
            style={{ marginTop: 20 }}
          >
            <DataDescTable dataSource={item.inputs} />
            <DataDescTable dataSource={item.outputs} style={{ marginTop: 16 }} />
          </CollapseItem>
        ))}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default DataParams;
