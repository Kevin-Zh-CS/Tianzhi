import React from 'react';
import DataDesc from '@/components/DataDesc';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { Table, Descriptions } from 'quanta-design';
// import DataParams from '@/components/DataParams';
import styles from './index.less';

function DataShareDesc(props) {
  const { info, extra, ...restProps } = props;

  return (
    <div className="container-card" style={{ marginTop: 16 }} {...restProps}>
      <DataDesc info={info} extra={extra} />
      <Descriptions>
        <Descriptions.Item label="数据参数">
          <Collapse
            defaultActiveKey="1"
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            className={styles.collpase}
          >
            <Collapse.Panel header="数据字段" key="1">
              <Table
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
                dataSource={JSON.parse(info.args || '{}').fields}
                pagination={false}
              />
            </Collapse.Panel>
          </Collapse>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default DataShareDesc;
