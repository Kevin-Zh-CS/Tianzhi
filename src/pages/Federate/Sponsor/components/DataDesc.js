import React from 'react';
import { Descriptions, Tag } from 'quanta-design';
import { APPROVE_CONTENT, DATA_JOIN_TYPE, DATA_TYPE_TEXT, PRIVATE_TYPE } from '@/utils/enums';
import { dark_background } from '@/pages/Federate/config';
import { DATA_THEME } from '@/pages/Manage/Outer/config';

function DataDesc(props) {
  const {
    dataType,
    appkeyDataDetail,
    dataName,
    orgName,
    isPrivate,
    isDrawer,
    desc,
    formatDesc,
    detail,
  } = props;

  const getTopicsStr = function(topics) {
    return (topics || []).map(item => (
      <span style={{ marginRight: 8 }} key={item.key}>
        {DATA_THEME[item].value}
      </span>
    ));
  };
  const dbTypeMap = {
    mysql: 'MySQL',
    mongo: 'MongoDB',
    postgres: 'PostgreSQL',
    oracle: 'Oracle',
  };
  return (
    <Descriptions labelStyle={{ width: 90 }} style={{ marginLeft: isDrawer ? 0 : -12 }} column={2}>
      <Descriptions.Item contentStyle={dark_background} label="数据名称" span={2}>
        {dataName}
      </Descriptions.Item>
      {Number(dataType) === DATA_JOIN_TYPE.LOCAL_APPKEY && (
        <>
          <Descriptions.Item contentStyle={dark_background} label="数据类型" span={2}>
            {DATA_TYPE_TEXT[appkeyDataDetail.data_type]}
          </Descriptions.Item>
          {isDrawer ? (
            <Descriptions.Item contentStyle={dark_background} label="数据哈希" span={2}>
              {appkeyDataDetail.data_hash}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item contentStyle={dark_background} label="数据描述" span={2}>
            {appkeyDataDetail.data_desc}
          </Descriptions.Item>

          {isDrawer ? (
            <Descriptions.Item label="数据主题" span={2}>
              {getTopicsStr(appkeyDataDetail.data_topics) || '-'}
            </Descriptions.Item>
          ) : null}
          {appkeyDataDetail.data_type === 3 ? (
            <Descriptions.Item contentStyle={dark_background} label="数据库类型" span={2}>
              {dbTypeMap[appkeyDataDetail.kind]}
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item contentStyle={dark_background} label="所属机构" span={2}>
            {orgName}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={dark_background} label="使用限制" span={2}>
            {PRIVATE_TYPE[isPrivate ? 1 : 0]}
          </Descriptions.Item>
          {appkeyDataDetail.data_type === 3 ? (
            <Descriptions.Item
              contentStyle={dark_background}
              label="是否审核"
              span={isDrawer ? 1 : 2}
            >
              {detail.is_need_approval ? '是' : '否'}
            </Descriptions.Item>
          ) : null}
          {detail.is_need_approval ? (
            <Descriptions.Item
              contentStyle={dark_background}
              label="审核内容"
              span={isDrawer ? 1 : 2}
            >
              {APPROVE_CONTENT[detail.approve_content || 0]}
            </Descriptions.Item>
          ) : null}
        </>
      )}
      {Number(dataType) === DATA_JOIN_TYPE.LOCAL_IMPORT && (
        <>
          <Descriptions.Item contentStyle={dark_background} label="数据描述" span={2}>
            {desc}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={dark_background} label="数据类型" span={2}>
            数据源{' '}
            <Tag
              color="processing"
              bordered
              style={{ background: 'rgba(255, 173, 50, 0.1)', marginLeft: 10 }}
            >
              本地数据
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item contentStyle={dark_background} label="所属机构" span={2}>
            {orgName}
          </Descriptions.Item>
        </>
      )}

      {Number(dataType) === DATA_JOIN_TYPE.INVITED && (
        <>
          <Descriptions.Item contentStyle={dark_background} label="所属机构" span={2}>
            {orgName}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={dark_background} label="格式说明" span={2}>
            {formatDesc}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={dark_background} label="使用限制" span={2}>
            {PRIVATE_TYPE[isPrivate ? 1 : 0]}
          </Descriptions.Item>
          <Descriptions.Item
            contentStyle={dark_background}
            label="是否审核"
            span={isDrawer ? 1 : 2}
          >
            {detail.is_need_approval ? '是' : '否'}
          </Descriptions.Item>
          {detail.is_need_approval ? (
            <Descriptions.Item
              contentStyle={dark_background}
              label="审核内容"
              span={isDrawer ? 1 : 2}
            >
              {APPROVE_CONTENT[detail.approve_content || 0]}
            </Descriptions.Item>
          ) : null}
        </>
      )}
    </Descriptions>
  );
}

export default DataDesc;
