import React from 'react';
import classNames from 'classnames';
import recordButton from '@/assets/blacklist/recordButton.png';
import recordButton_hover from '@/assets/blacklist/recordButton_hover.png';
import recordButton_active from '@/assets/blacklist/recordButton_active.png';
import settingButton from '@/assets/blacklist/settingButton.png';
import settingButton_hover from '@/assets/blacklist/settingButton_hover.png';
import settingButton_active from '@/assets/blacklist/settingButton_active.png';
import settingButton_disabled from '@/assets/blacklist/settingButton_disabled.png';
import styles from './index.less';

const LeftButton = props => {
  const { className = '', onClick } = props;
  return (
    <div className={classNames(className, styles.button)} onClick={onClick}>
      <img alt="" src={recordButton} />
      <img alt="" src={recordButton_hover} />
      <img alt="" src={recordButton_active} />
    </div>
  );
};
const RightButton = props => {
  const { className = '', disabled } = props;
  return disabled ? (
    <div className={classNames(className, styles.disabled)}>
      <img alt="" src={settingButton_disabled} />
    </div>
  ) : (
    <div className={classNames(className, styles.button)}>
      <img alt="" src={settingButton} />
      <img alt="" src={settingButton_hover} />
      <img alt="" src={settingButton_active} />
    </div>
  );
};

export { LeftButton, RightButton };
