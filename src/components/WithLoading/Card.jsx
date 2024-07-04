import React from 'react';
import { Skeleton } from 'antd';
import styles from './Card.less';

function Card() {
  return (
    <div className={styles.card}>
      <Skeleton
        active
        title={false}
        paragraph={{ rows: 4, width: ['70%', '100%', '70%', '100%'] }}
      />
      <div className={styles.bottom}>
        <Skeleton
          active
          avatar={{ shape: 'circle', size: 'small' }}
          paragraph={false}
          className={styles.bottomItem}
        />
        <Skeleton
          active
          avatar={{ shape: 'circle', size: 'small' }}
          paragraph={false}
          className={styles.bottomItem}
        />
      </div>
    </div>
  );
}

export default Card;
