import React from 'react';
import classnames from 'classnames';

import styles from './index.less';

export default ({ className }) => <span className={classnames(className, styles.dotting)} />;
