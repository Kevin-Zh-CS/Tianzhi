import React from 'react';
import { router } from 'umi';
import { Descriptions, Table, Button } from 'quanta-design';
import { DATA_MODEL_STATE } from '@/utils/enums';

function QflDataFormat(props) {
  const {
    data_id,
    taskId,
    project_id,
    participate_status,
    data_name = '',
    format_desc = '',
    require_format = [],
    isAddData = false, // 添加数据中，不显示添加数据按钮
    ...restProps
  } = props;
  return (
    <div className="qfl-descriptions">
      <Descriptions
        title="数据格式"
        labelStyle={{ width: 105 }}
        extra={
          participate_status === DATA_MODEL_STATE.DATA_PASS &&
          !isAddData && (
            <Button
              type="primary"
              onClick={() =>
                router.push(`/qfl/partner/addData?dataId=${data_id}&projectId=${project_id}`)
              }
            >
              添加数据
            </Button>
          )
        }
        {...restProps}
      >
        <Descriptions.Item label="所需数据名称">{data_name}</Descriptions.Item>
        <Descriptions.Item label="格式说明">{format_desc}</Descriptions.Item>
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
            dataSource={require_format || []}
            pagination={false}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default QflDataFormat;
