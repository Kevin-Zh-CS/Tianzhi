import React from 'react';
import classnames from 'classnames';
import noAuth from '@/assets/no_auth.png';

import styles from './index.less';

export default ({ className, ...restProps }) => (
  <div className={classnames(styles.noAuth, className)} {...restProps}>
    <img src={noAuth} alt="no auth" width={200} height={200} />
    <div className={styles.hint}>你没有该数据所在资源库的权限，</div>
    <div className={styles.hint}>请联系管理员把你加入该资源库吧～</div>
  </div>
);
