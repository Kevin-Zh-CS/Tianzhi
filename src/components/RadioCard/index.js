import React from 'react';
import { IconBase, Icons } from 'quanta-design';
import styles from './index.less';

const { CheckIcon } = Icons;

function RadioCard({
  active = true,
  icon = '',
  title = '',
  desc = '',
  onClick,
  disabled,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`${styles.RadioCard} hover-style ${active ? styles.active : ''} ${
        disabled ? styles.disabledCard : ''
      }`}
      {...props}
    >
      <IconBase icon={icon} />
      <div style={{ marginLeft: 8 }}>
        <span className={styles.title}>{title}</span>
        <span className={styles.desc}>{desc}</span>
      </div>
      {active ? (
        <>
          <div className={styles.tag} />
          <CheckIcon className={styles.icon} fill="white" />
        </>
      ) : null}
    </div>
  );
}

export default RadioCard;
