import React, { useState, useEffect } from 'react';
import { formatNumer } from '@/utils/helper';
import { Tooltip } from 'quanta-design';
import styles from './index.less';

function Rate(props) {
  const { infoList = [] } = props;
  const color = ['#66ADE8', '#EF898E', '#FFCE84', '#9EEAC5'];
  const type = ['文件', '接口', '模型', '数据源'];
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let t = 0;
    infoList.map(item => {
      t += item.acquired_num;
      return item;
    });
    setTotal(t);
  }, []);
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
          infoList.map((item, index) => (
            <Tooltip title={`${type[index]}：${item.acquired_num}个`}>
              <div
                key={item.type}
                className={styles.block}
                style={{ background: color[index], width: `${(item.acquired_num / total) * 100}%` }}
              />
            </Tooltip>
          ))
        ) : (
          <div className={`${styles.blank} ${styles.block}`} />
        )}
      </div>
      {/* <div className={styles.badges}>
        {infoList.map((_, index) => (
          <div>
            <div className={styles.tip} style={{ background: color[index] }} />
            {type[index]}
          </div>
        ))}
      </div> */}
    </div>
  );
}

export default Rate;
