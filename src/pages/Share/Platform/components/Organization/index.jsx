import React, { useState } from 'react';
import defaultAvatar from '@/assets/share/default_avatar.png';
import styles from './index.less';

const OrgHoverCard = ({
  org_logo,
  org_name,
  org_desc,
  provided_data_num,
  obtained_data_num,
  x,
  y,
}) => (
  <div className={styles.hoverCard} style={{ left: x, top: y }}>
    <img alt="" src={org_logo || defaultAvatar} width={40} height={40} />
    <div>
      <span className={styles.title}>{org_name}</span>
      <p className={styles.desc}>{org_desc}</p>
      <div className={styles.tail}>
        <div>
          <span>已发布数据</span>
          <span className={styles.num}>{provided_data_num}个</span>
        </div>
        <div>
          <span>已获取数据</span>
          <span className={styles.num}>{obtained_data_num}个</span>
        </div>
      </div>
    </div>
  </div>
);

function Organization(props) {
  const [showhoverCard, setShowHoverCard] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const {
    org_logo,
    org_name,
    org_desc,
    provided_data_num,
    obtained_data_num,
    active,
    ...restProps
  } = props;
  return (
    <>
      {showhoverCard ? (
        <OrgHoverCard
          org_logo={org_logo || defaultAvatar}
          org_name={org_name}
          org_desc={org_desc}
          provided_data_num={provided_data_num}
          obtained_data_num={obtained_data_num}
          {...cardPosition}
        />
      ) : null}
      <div
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
        onMouseMove={e => setCardPosition({ x: e.pageX + 10, y: e.pageY + 5 })}
        className={`${styles.orgCard} hover-style ${active ? styles.active : ''}`}
        {...restProps}
      >
        <img alt="" src={org_logo || defaultAvatar} width={40} height={40} />
        <div style={{ marginLeft: 12 }}>
          <span className={styles.title}>{org_name}</span>
          <span className={styles.body}>{provided_data_num}个数据</span>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div className={styles.divider} />
      </div>
    </>
  );
}

export default Organization;
