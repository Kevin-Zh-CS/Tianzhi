import React from 'react';
import { Button, IconBase, Tag } from 'quanta-design';
import { router } from 'umi';
import { formatTime } from '@/utils/helper';
import { DATA_TOPIC_TEXT } from '@/utils/enums';
import { getFileIcon } from '@/utils/icons';
import styles from './index.less';
import { Typography } from 'antd';
import { getAuthStatus, getOrderType } from '@/pages/Share/Platform/config';

const { Paragraph } = Typography;
function DataCard(props) {
  const handleDetail = () => {
    router.push({
      pathname: '/share/platform/datadetail',
      query: { dataId: props.id },
    });
  };
  return (
    <div className={`${styles.dataCard} container-card`}>
      <IconBase icon={getFileIcon(props.type, props.kind)} width={40} height={40} />
      <div className={styles.main}>
        <span className={styles.title}>{props.name}</span>
        <Paragraph ellipsis={{ rows: 2 }} className={styles.desc}>
          {props.desc}
        </Paragraph>
        <p style={{ marginBottom: 8 }}>
          {(props.topics || []).map(item => (
            <span className={styles.topic}>
              <Tag bordered color="processing">
                {DATA_TOPIC_TEXT[item]}
              </Tag>
            </span>
          ))}
        </p>
        <span className={styles.tail_head}>所属机构：{props.org_name}</span>
        <span className={styles.tail}>更新时间：{formatTime(props.update_time)}</span>
      </div>
      <div className={styles.aside}>
        <span className={styles.type}>{getOrderType(props.status)}</span>
        <span className={styles.statusText}>
          {getAuthStatus({
            auth: props.status,
            status: props.in_white_list,
            extra: props.extra || '{}',
          })}
        </span>
        <Button type="primary" onClick={handleDetail}>
          查看详情
        </Button>
      </div>
    </div>
  );
}

export default DataCard;
