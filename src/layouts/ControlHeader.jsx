import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { connect } from 'dva';
import { Avatar, Badge } from 'antd';
import {
  Layout,
  Divider,
  Dropdown,
  IconBase,
  Icons,
  Menu,
  notification,
  Tooltip,
} from 'quanta-design';
import Link from 'umi/link';
import classnames from 'classnames';
import { ReactComponent as MessagesIcon } from '@/icons/messages.svg';
import { ReactComponent as BitxMeshLogo } from '@/assets/bitxmesh_logo.svg';
import { ReactComponent as SettingIcon } from '@/icons/sets.svg';
import { ReactComponent as PlatformIcon } from '@/icons/platform.svg';
import managerAvatar from '@/assets/default/manager.png';
import userAvatar from '@/assets/default/user.png';
import styles from './ControlHeader.less';
import MessageModel from '@/pages/Message';
import AccountCard from '@/pages/Account/card';
import { flipAlter, getNotification, getUnReadNum, markMessageRead } from '@/services/message';
import { gotoMessageDetail } from '@/utils/message';

const { Header } = Layout;
const { CaretDownIcon, CloseCircleIcon, CheckCircleIcon, WarningCircleIcon } = Icons;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let timer = null;

function ControlHeader(props) {
  const { location = {}, userInfo = {}, totalNum, dispatch, onShowModel, showModel, menus } = props;
  const { pathname = {} } = location;
  const [notRead, setNotRead] = useState(0);

  useEffect(() => {
    if (dispatch) {
      dispatch({ type: 'account/info' });
      dispatch({ type: 'organization/info' });
      dispatch({ type: 'account/getMenusList' });
    }
  }, []);

  const getNotReadMessage = async () => {
    const data = await getUnReadNum();
    setNotRead(data);
  };

  const openNotificationWithIcon = (data, type) => {
    const typeIcons = [
      '',
      <WarningCircleIcon
        fill="currentColor"
        fontSize="inherit"
        className="quanta-notification-notice-icon-warning"
      />,
      <CheckCircleIcon
        fill="currentColor"
        fontSize="inherit"
        className="quanta-notification-notice-icon-success"
      />,
      <CloseCircleIcon
        fill="currentColor"
        fontSize="inherit"
        className="quanta-notification-notice-icon-error"
      />,
    ];
    notification.open({
      message: data.title,
      icon: typeIcons[type],
      // eslint-disable-next-line no-nested-ternary
      className: `quanta-notification-notice-${
        // eslint-disable-next-line no-nested-ternary
        type === 1 ? 'warning' : type === 2 ? 'success' : 'error'
      }`,
      description: <div style={{ cursor: 'pointer' }}>{data.content}</div>,
      duration: 4.5,
      onClick: async () => {
        gotoMessageDetail(data, pathname);
        await markMessageRead(data.msg_id);
        await getNotReadMessage();
        notification.destroy();
      },
    });
    // 由于hover时弹窗会一直在页面上，设置和弹窗的duration时间相同的setTimeout函数
    setTimeout(async () => {
      notification.destroy();
    }, 4500);
  };

  useEffect(() => {
    getNotReadMessage();
  }, [totalNum]);

  const getOpenMessage = async () =>
    new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
        try {
          const data = await getNotification();
          await getNotReadMessage();
          const dataList = data.list;
          if (dataList.length !== 0) {
            // eslint-disable-next-line array-callback-return
            dataList.map(async item => {
              await flipAlter(item.msg_id);
              openNotificationWithIcon(item, item.biz_type);
            });
          }
          resolve(getOpenMessage());
        } catch (e) {
          reject(e);
          clearTimeout(timer);
          timer = null;
        }
      }, 6000);
    });

  useEffect(() => {
    if (document.getElementsByClassName('quanta-notification').length === 0) {
      getOpenMessage();
    }
    return () => {
      clearTimeout(timer);
      timer = null;
    };
  }, []);

  const isSharePage = pathname.indexOf('/share') !== -1;
  const isManagePage = pathname.indexOf('/manage') !== -1;
  const isFederatePage = pathname.indexOf('/federate') !== -1;
  const isQFLPage = pathname.indexOf('/qfl') !== -1;

  const menu2 = (
    <Menu>
      <Menu.Item
        onClick={() => router.push('/backstage/organization/info')}
        className={styles.menuItem}
      >
        <IconBase icon={PlatformIcon} />
        后台管理
      </Menu.Item>
    </Menu>
  );

  const handleClick = e => {
    e.stopPropagation();
    onShowModel();
  };

  const goToDetail = detail => {
    gotoMessageDetail(detail, pathname);
  };

  const menusMap = {
    1: (
      <>
        <Link
          to="/share"
          className={classnames(styles.backControl, isSharePage ? styles.active : '')}
        >
          数据交换
        </Link>
        <Link
          style={{ marginLeft: 20 }}
          to="/manage"
          className={classnames(styles.backControl, isManagePage ? styles.active : '')}
        >
          数据管理
        </Link>
      </>
    ),
    2: (
      <Link
        style={{ marginLeft: 20 }}
        to="/federate/application"
        className={classnames(styles.backControl, isFederatePage ? styles.active : '')}
      >
        隐私计算
      </Link>
    ),
    3: (
      <Link
        style={{ marginLeft: 20 }}
        to="/qfl/sponsor/repository"
        className={classnames(styles.backControl, isQFLPage ? styles.active : '')}
      >
        联邦学习
      </Link>
    ),
  };

  const handleChangeClick = v => {
    if (v) {
      dispatch({ type: 'organization/info' });
    }
  };

  return (
    <div>
      <MessageModel
        show={showModel}
        setUploadModal={onShowModel}
        getNotReadMessage={getNotReadMessage}
        gotoMessageDetail={goToDetail}
      />
      <Header className={styles.header}>
        <div className={styles.left}>
          <BitxMeshLogo className="hover-style" onClick={() => router.push('/share')} />
          <Divider
            type="vertical"
            style={{ borderLeftColor: '#353535', height: '22px', margin: '0 24px 0 33px' }}
          />
          {menus.map(item => menusMap[item.module_id])}
        </div>
        <div className={styles.right}>
          <Dropdown placement="bottomRight" overlay={menu2}>
            <div className={`${styles.right} hover-style`}>
              <IconBase
                icon={SettingIcon}
                style={{ marginRight: 20 }}
                onClick={() => router.push('/backstage/organization/info')}
                fill="currentColor"
                width={20}
                height={20}
              />
            </div>
          </Dropdown>
          <IconBase
            icon={MessagesIcon}
            fill="currentColor"
            width={25}
            height={25}
            onClick={handleClick}
          />
          <Badge
            style={{ borderColor: '#E53B43' }}
            count={notRead}
            offset={[-10, -16]}
            size="small"
          />
          <Tooltip
            trigger="click"
            overlayClassName={styles.overlayAccountCard}
            onVisibleChange={handleChangeClick}
            title={<AccountCard />}
          >
            <div className={`${styles.right} hover-style`} style={{ marginLeft: notRead ? 0 : 16 }}>
              <Avatar
                src={userInfo.is_admin ? managerAvatar : userAvatar}
                style={{
                  width: 28,
                  height: 28,
                  background: '#fff',
                }}
              />
              <CaretDownIcon style={{ marginLeft: 4 }} />
            </div>
          </Tooltip>
        </div>
      </Header>
    </div>
  );
}

export default connect(({ account, message }) => ({
  userInfo: account.info,
  totalNum: message.totalNum,
  menus: account.menus,
}))(ControlHeader);
