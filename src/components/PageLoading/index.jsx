import React from 'react';
import { Spin } from 'quanta-design';
import styles from './index.less';

// loading components from code split
export default () => (
  <div className={`${styles.pageLoading} pageLoading`}>
    <Spin />
  </div>
);
