import React from 'react';
import { Avatar } from 'antd';
import { Tag } from 'quanta-design';
import qulianLogo from '@/assets/qulian_logo.png';

import styles from './index.less';

function Header(props) {
  const {
    org,
    // list = []
  } = props;
  // const [online, setOnline] = useState(0);
  // useEffect(() => {
  //   const onlineList = list.filter(item => item.node_status === 1);
  //   setOnline(onlineList.length);
  // }, [list]);
  return (
    <div className={styles.headerWrap}>
      <div className={styles.firstWrap}>
        <Avatar
          style={{
            width: 68,
            height: 68,
            background: '#f6f6f6',
          }}
          src={qulianLogo}
        />
      </div>
      <div className={styles.secondWrap}>
        <div className={styles.companyName}>
          {org.name}
          <Tag color="success" style={{ marginLeft: 12 }}>
            运行中
          </Tag>
        </div>
        <div style={{ marginTop: 16 }}>
          <span className={styles.label}>机构ID</span>
          <span>{org.org_id}</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <span className={styles.label}>入驻时间</span>
          <span>{org?.peer_info?.registerTime}</span>
        </div>
      </div>
      {/* <div className={styles.thirdWrap}>
        <div className={styles.userLabel}>当前活跃用户</div>
        <div className={styles.userNum}>
          <span className={styles.onlineNum}>{online}</span>
          <span className={styles.totalNum}>/{list.length}</span>
        </div>
      </div> */}
    </div>
  );
}

export default Header;
