import React from 'react';
import { Icons } from 'quanta-design';
import styles from './index.less';

const { CheckIcon } = Icons;

function RadioPriceCard({
  active = false,
  count = '',
  time = '',
  price = '',
  onClick = () => {},
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`${styles.RadioCard} hover-style ${active ? styles.active : ''}`}
      {...props}
    >
      <div>
        <div className={styles.top}>
          <div className={styles.time}>{time}</div>
          <div className={styles.count}>{count}</div>
        </div>
        <div className={styles.price}>{price} Bx</div>
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

export default RadioPriceCard;
