import React from 'react';
import classnames from 'classnames';

import styles from './index.less';

export default ({ title = null, extra = null, children = null, className, ...restProps }) => {
  const itemTitle = (
    <div className={`${styles.itemTitle} ${className} item-title`} {...restProps}>
      {children || title}
    </div>
  );
  if (extra) {
    return (
      <div className={classnames(styles.itemTitleWithExtra, className, 'item-title-with-extra')}>
        {itemTitle}
        {extra}
      </div>
    );
  }
  return itemTitle;
};
