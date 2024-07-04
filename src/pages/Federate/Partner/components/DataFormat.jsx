import React from 'react';
import { router } from 'umi';
import { Descriptions, Table, Button } from 'quanta-design';
import { DATA_MODEL_STATE } from '@/utils/enums';

function DataFormat(props) {
  const {
    dataId,
    taskId,
    isAddData = false, // 添加数据中，不显示添加数据按钮
    info,
    ...restProps
  } = props;

  return (
    <Descriptions
      title="数据格式"
      labelStyle={{ width: 104 }}
      extra={
        info.data_status === DATA_MODEL_STATE.DATA_PASS &&
        !isAddData && (
          <Button
            type="primary"
            onClick={() =>
              router.push(`/federate/partner/addData?dataId=${dataId}&taskId=${taskId}`)
            }
          >
            添加数据
          </Button>
        )
      }
      {...restProps}
    >
      <Descriptions.Item label="所需数据名称">{info.name}</Descriptions.Item>
      <Descriptions.Item label="格式说明">{info.format_desc}</Descriptions.Item>
      <Descriptions.Item label="数据说明">
        <Table
          style={{ width: '80%' }}
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
          dataSource={info.need_data_meta}
          pagination={false}
        />
      </Descriptions.Item>
    </Descriptions>
  );
}

export default DataFormat;
