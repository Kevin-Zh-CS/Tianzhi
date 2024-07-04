import React from 'react';
import { Descriptions, Table } from 'quanta-design';
import styles from './index.less';
import { APPROVE_CONTENT, PRIVATE_TYPE } from '@/utils/enums';

function DataInvitationDesc({ dataInfo, info, isDetail, ...restProps }) {
  const { total = 0, list = [], columns = [] } = dataInfo;

  return (
    <Descriptions title="数据详情" {...restProps} className={styles.dataDesc} column={2}>
      <Descriptions.Item label="数据名称" span={2}>
        {dataInfo.name}
      </Descriptions.Item>
      <Descriptions.Item label="数据描述" span={2}>
        {dataInfo.desc}
      </Descriptions.Item>
      {info ? (
        <>
          <Descriptions.Item label="使用限制" span={2}>
            {PRIVATE_TYPE[info.is_private ? 1 : 0]}
          </Descriptions.Item>
          {/* 数据源 */}
          <Descriptions.Item label="是否审核" span={info.need_approval ? 1 : 2}>
            {info.need_approval === null ? '-' : info.need_approval ? '是' : '否'}
          </Descriptions.Item>
          {info.need_approval ? (
            <Descriptions.Item label="审核内容" span={1}>
              {APPROVE_CONTENT[info.approve_content]}
            </Descriptions.Item>
          ) : null}
        </>
      ) : null}
      <Descriptions.Item label="数据内容" span={2}>
        <div>
          <div style={{ marginBottom: 8 }}>共{total || list.length}条数据</div>
          <Table columns={columns} dataSource={list} pagination={false} />
        </div>
      </Descriptions.Item>
    </Descriptions>
  );
}

export default DataInvitationDesc;
