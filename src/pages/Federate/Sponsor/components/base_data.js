import React from 'react';
import { Descriptions } from 'quanta-design';
import styles from './index.less';

function BaseData(props) {
  const { info } = props;

  return (
    <Descriptions className={styles.baseDetail} title="基本信息">
      <Descriptions.Item label="任务名称">{info.task_name || '-'}</Descriptions.Item>
      <Descriptions.Item label="任务ID">{info.task_id || '-'}</Descriptions.Item>
      <Descriptions.Item label="接口地址">{info.url}</Descriptions.Item>
      <Descriptions.Item label="请求方式">
        {info.req_method === 0 ? 'GET' : 'POST'}
      </Descriptions.Item>
      <Descriptions.Item label="返回类型">JSON</Descriptions.Item>
    </Descriptions>
  );
}

export default BaseData;
