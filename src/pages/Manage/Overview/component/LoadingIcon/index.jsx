import React from 'react';
import { IconBase } from 'quanta-design';
import { ReactComponent as ChartLoadingIcon } from '@/icons/chart_loading_icon.svg';
import styles from './index.less';

export default () => (
  <IconBase className={styles.rotateIcon} icon={ChartLoadingIcon} fill="#3C6DF0" />
);
