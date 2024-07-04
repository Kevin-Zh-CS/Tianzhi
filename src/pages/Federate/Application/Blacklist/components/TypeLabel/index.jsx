import React from 'react';
import styles from './index.less';

const SingleLabel = () => <div className={styles.singleLabel}>单条查询</div>;
const BatchLabel = () => <div className={styles.batchLabel}>批量查询</div>;

export { SingleLabel, BatchLabel };
