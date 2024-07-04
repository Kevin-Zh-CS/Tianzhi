import React from 'react';
import { Descriptions } from 'quanta-design';
import { PRIVATE_TYPE, DATA_TYPE_TEXT, PUBLISH_TYPE_TEXT, APPROVE_CONTENT } from '@/utils/enums';
import { DATA_THEME } from '@/pages/Manage/Inner/config';

function DataDesc(props) {
  const { info, extra } = props;

  return (
    <Descriptions title="数据详情" column={2} extra={extra}>
      <Descriptions.Item label="数据名称" span={2}>
        {info.name}
      </Descriptions.Item>
      <Descriptions.Item label="数据类型" span={2}>
        {DATA_TYPE_TEXT[info.data_type]}
      </Descriptions.Item>
      <Descriptions.Item label="所属机构" span={2}>
        {info.org_name}
      </Descriptions.Item>
      <Descriptions.Item label="数据描述" span={2}>
        {info.data_desc}
      </Descriptions.Item>
      <Descriptions.Item label="数据主题" span={2}>
        {info.data_topics
          ? info.data_topics.map(item => (
              <span style={{ marginRight: 8 }}>{DATA_THEME[item].value}</span>
            ))
          : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="使用限制" span={2}>
        {PRIVATE_TYPE[info.is_private ? 1 : 0]}
      </Descriptions.Item>
      {/* 数据源 */}
      {info.data_type === 3 ? (
        <Descriptions.Item label="是否审核" span={info.need_approval ? 1 : 2}>
          {info.need_approval === null ? '-' : info.need_approval ? '是' : '否'}
        </Descriptions.Item>
      ) : null}
      {info.data_type === 3 && info.need_approval ? (
        <Descriptions.Item label="审核内容" span={1}>
          {APPROVE_CONTENT[info.approve_content]}
        </Descriptions.Item>
      ) : null}
      <Descriptions.Item label="共享类型" span={2}>
        {PUBLISH_TYPE_TEXT[info.order_type]}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default DataDesc;
