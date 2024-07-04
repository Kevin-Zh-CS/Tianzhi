import React from 'react';
import { connect } from 'dva';
import { APPROVE_CONTENT, DATA_THEME, DATA_TYPE_TEXT, PRIVATE_TYPE_LIST } from '@/utils/enums';
import { Descriptions, IconBase } from 'quanta-design';
import styles from './index.less';
import { getOrderType } from '@/pages/Share/Platform/config';
import { getFileIcon } from '@/utils/icons';
import { ReactComponent as fileIcon } from '@/icons/file.svg';

function Info(props) {
  const { dataDetail = {} } = props;
  return (
    <div className={styles.dataInfo}>
      <div className={styles.title}>
        <IconBase
          icon={dataDetail.data_type ? getFileIcon(dataDetail.data_type) : fileIcon}
          width={40}
          height={40}
        />
        <span>{dataDetail.data_name}</span>
      </div>
      <Descriptions column={2} className={styles.descriptions} labelStyle={{ width: 76 }}>
        <Descriptions.items label="数据类型">
          {DATA_TYPE_TEXT[dataDetail.data_type]}
        </Descriptions.items>
        <Descriptions.items label="共享类型">
          {getOrderType(dataDetail.order_type)}
        </Descriptions.items>
        <Descriptions.Item label="数据主题">
          {(dataDetail.data_topics || []).map(item => (
            <span style={{ marginRight: 8 }}>{DATA_THEME[item].value}</span>
          ))}
        </Descriptions.Item>
        <Descriptions.items label="数据哈希">
          {dataDetail.data_hash || dataDetail.data_id}
        </Descriptions.items>
        <Descriptions.items label="所属机构">{dataDetail.org_name}</Descriptions.items>
        <Descriptions.items label="机构节点" span="2">
          {dataDetail.org_node}
        </Descriptions.items>
        <Descriptions.Item label="使用限制">
          {PRIVATE_TYPE_LIST[dataDetail.is_private || 'false']}
        </Descriptions.Item>
        <Descriptions.Item label="是否审核">
          {dataDetail.need_approval ? '是' : '否'}
        </Descriptions.Item>
        {dataDetail.need_approval ? (
          <Descriptions.Item label="审核内容">
            {APPROVE_CONTENT[dataDetail.approve_content || 0]}
          </Descriptions.Item>
        ) : null}
      </Descriptions>
    </div>
  );
}

export default connect(({ datasharing }) => ({
  dataDetail: datasharing.dataDetail,
}))(Info);
