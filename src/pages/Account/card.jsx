import React, { useState } from 'react';
import { connect } from 'dva';
import { Descriptions, Tooltip } from 'quanta-design';
import CopyToClipboard from 'react-copy-to-clipboard';
import styles from './index.less';
import { Avatar } from 'antd';
import managerAvatar from '@/assets/default/manager.png';
import userAvatar from '@/assets/default/user.png';
import { router } from 'umi';
import classnames from 'classnames';
import { getValidCredit } from '@/utils/helper';

const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
function AccountCard({ userInfo = {}, orgInfo = {} }) {
  const { name: userName, addr: address } = userInfo;
  const { name: orgName, credit } = orgInfo;
  const [copyTooltip, setCopyTooltip] = useState(false);

  const handleLogOut = () => {
    // onCancel();
    router.push('/login');
    localStorage.removeItem('token');
    localStorage.removeItem('expire');
  };

  const goToDetail = () => {
    // onCancel();
    router.push('/account');
  };

  const goToPrice = () => {
    router.push('/backstage/credit/info');
  };

  return (
    <div
      onClick={e => {
        e.stopPropagation();
      }}
      className={classnames(styles.accountWrap, styles.show)}
    >
      <div className={styles.header}>
        <Avatar src={userInfo.is_admin ? managerAvatar : userAvatar} className={styles.userIcon} />
        <div className={styles.userTxt}>{userName}</div>
        <div className={styles.orgTxt}>{orgName}</div>
      </div>
      <div className={styles.content}>
        <Descriptions
          title="个人信息"
          labelStyle={{ width: 76 }}
          extra={<a onClick={goToDetail}>个人中心</a>}
        >
          <Descriptions.Item contentStyle={contentStyle} label="用户名">
            {userName}
          </Descriptions.Item>
          <Descriptions.Item contentStyle={contentStyle} label="用户地址">
            {address
              ? `${address.substr(0, 8)}...${address.substr(address.length - 8, address.length)}`
              : ''}
            <Tooltip title="复制成功" color="#08CB94" visible={copyTooltip}>
              <CopyToClipboard
                onCopy={() => {
                  setCopyTooltip(true);
                  setTimeout(() => {
                    setCopyTooltip(false);
                  }, 1000);
                }}
                text={address}
              >
                <a>复制</a>
              </CopyToClipboard>
            </Tooltip>
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className={styles.content}>
        <Descriptions
          title="账户信息"
          labelStyle={{ width: 76 }}
          extra={<a onClick={goToPrice}>积分明细</a>}
        >
          <Descriptions.Item label="可用积分">
            <span className={styles.price}>{getValidCredit(credit)} Bx</span>
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className={styles.footer} onClick={handleLogOut}>
        退出登录
      </div>
    </div>
  );
}

export default connect(({ account, organization }) => ({
  userInfo: account.info,
  orgInfo: organization.info,
}))(AccountCard);
