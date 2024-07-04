import React from 'react';
import styles from './index.less';

function BlockchainStamp({ hash = '' }) {
  return (
    <div className={styles.box1}>
      <div className={styles.box2}>
        <div className={styles.box3}>
          <span className={styles.title}>已上链</span>
          <div className={styles.divider}>
            <div className={styles.line} />
            <div className={styles.square} />
            <div className={styles.line} />
          </div>
          <span className={styles.hash}>
            任务哈希：{hash.slice(0, 5)}...{hash.slice(-5)}
          </span>
          <span className={styles.bitxmesh}>BitXMesh</span>
        </div>
      </div>
    </div>
  );
}

export default BlockchainStamp;
