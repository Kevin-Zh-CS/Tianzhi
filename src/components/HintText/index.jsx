import React from 'react';
import classnames from 'classnames';

import './index.less';

export default ({ className, icon, children, ...props }) => (
  <div
    className={classnames(className, 'ide-hint-text-wrapper', {
      'ide-hint-text-wrapper-has-icon': !!icon,
    })}
    {...props}
  >
    {icon}
    <div className="ide-hint-text">{children}</div>
  </div>
);
