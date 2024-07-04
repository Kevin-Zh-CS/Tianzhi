import React from 'react';
import styles from './index.less';
import warningNoteIcon from '@/icons/warning_note.png';
import successNoteIcon from '@/icons/success_note.png';
import failNoteIcon from '@/icons/fail_note.png';
import processingNoteIcon from '@/icons/processing_note.png';
import deleteNoteIcon from '@/icons/delete_note.png';

/* 状态卡片
  @type: { status }
  @value: { 0-warning, 1-error, 2-success, 3-info }
*/
const colorList = [styles.warning, styles.error, styles.success, styles.info, styles.delete];
const iconList = [
  warningNoteIcon,
  failNoteIcon,
  successNoteIcon,
  processingNoteIcon,
  deleteNoteIcon,
];
const OrderStatus = ({ status = 0, title = '', desc = '', ...restProps }) => (
  <div className={`${colorList[status]} ${styles.statusCard}`} {...restProps}>
    <img alt="" src={iconList[status]} width={72} height={72} className={styles.img} />
    <div>
      <div className={styles.title}>{title}</div>
      <div className={styles.desc}>{desc}</div>
    </div>
  </div>
);

export default OrderStatus;
