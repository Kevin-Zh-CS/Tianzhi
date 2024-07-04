import React from 'react';
import { Descriptions } from 'quanta-design';
import { DATA_PUBLISH_TYPE } from '@/pages/Manage/Inner/config';

function DataItem(props) {
  const { info } = props;

  return (
    <Descriptions title="区块链信息">
      <Descriptions.Item label="数据哈希">{info.data_hash || info.hash}</Descriptions.Item>
      <Descriptions.Item label="发布哈希">{info.tx_hash}</Descriptions.Item>
      <Descriptions.Item label="区块哈希">{info.blk_hash}</Descriptions.Item>
      <Descriptions.Item label="区块高度">{info.blk_height || info.blk_num}</Descriptions.Item>
      <Descriptions.Item label="数据类型">{DATA_PUBLISH_TYPE[info.type]}</Descriptions.Item>
    </Descriptions>
  );
}

export default DataItem;
