import React from 'react';
import { formatNumer } from '@/utils/helper';
import { Tooltip } from 'quanta-design';
import styles from './index.less';

function Rate(props) {
  const { infoList = [], total } = props;
  const color = ['#66ADE8', '#EF898E', '#FFCE84', '#9EEAC5', '#6BE0BF', '#A581F1', '#C2E8A0'];
  const type = ['文件', '接口', '模型', '数据源', '数据库', '数据导入', '信息摘要'];
  return (
    <div className={styles.contentWrap}>
      <div className={styles.statistics}>
        <span>各类资源占比</span>
        {total ? (
          <span>共计 {formatNumer(total)} 个</span>
        ) : (
          <span style={{ color: '#b7b7b7' }}>暂无数据</span>
        )}
      </div>
      <div className={styles.rate}>
        {total ? (
          infoList.map(item => (
            <Tooltip title={`${type[item.type]}：${item.total}个`}>
              <div
                key={item.type}
                className={styles.block}
                style={{ background: color[item.type], width: `${(item.total / total) * 100}%` }}
              />
            </Tooltip>
          ))
        ) : (
          <div className={`${styles.blank} ${styles.block}`} />
        )}
      </div>
    </div>
  );
}

export default Rate;
