import React from 'react';
import styles from './index.less';
import { formatTime } from '@/utils/helper';

function MessageCard(props) {
  const { item, iKnow, gotoMessageDetail } = props;

  return (
    <div className={styles.backNoRead}>
      <span>
        <i className={styles.dotElem}></i>
      </span>
      <div className={styles.messageCard}>
        <div className={styles.messageTitle}>{item.title}</div>
        <div
          onClick={e => {
            e.stopPropagation();
            gotoMessageDetail(item);
            iKnow(item);
          }}
        >
          <div className={styles.messageContent}>{item.content}</div>
        </div>
        <div className={styles.messageTime}>
          <span>{formatTime(item.create_time)}</span>
          <span
            className={styles.messageSpan}
            onClick={e => {
              e.stopPropagation();
              iKnow(item);
            }}
          >
            我知道了
          </span>
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
