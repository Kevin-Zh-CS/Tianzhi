import React from 'react';
import { IconBase, Menu } from 'quanta-design';
import { ReactComponent as DataPlatformIcon } from '@/icons/data_platform.svg';
import { ReactComponent as DataObtaionIcon } from '@/icons/data_obtain.svg';
import { ReactComponent as DataProvideIcon } from '@/icons/data_provide.svg';
import './index.less';
import router from 'umi/router';
import { connect } from 'dva';

function SharePage(props) {
  const { location, dispatch } = props;
  const isSharePage = location.pathname.indexOf('/share') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/share/provide/') !== -1) {
    selectedKeys = ['/share/provide/list'];
  } else if (location.pathname.indexOf('/share/obtain/') !== -1) {
    selectedKeys = ['/share/obtain/list'];
  } else if (location.pathname.indexOf('/share/platform') !== -1) {
    selectedKeys = ['/share/platform'];
  }

  const handleSelect = ({ key }) => {
    router.push({ pathname: key });
    if (key === '/share/platform' && location.pathname === key) {
      if (dispatch) {
        dispatch({
          type: 'datasharing/searchData',
          payload: { page: 1 },
        });
        dispatch({
          type: 'datasharing/dataStatistic',
        });
        dispatch({
          type: 'datasharing/orgList',
        });
      }
    }
  };
  if (isSharePage) {
    return (
      <div className="quanta-sider-menu-item">
        <Menu mode="inline" selectedKeys={selectedKeys} onClick={handleSelect}>
          <Menu.Item
            key="/share/platform"
            icon={<IconBase icon={DataPlatformIcon} fill="currentColor" />}
          >
            数据平台
          </Menu.Item>
          <Menu.Item
            key="/share/obtain/list"
            icon={<IconBase icon={DataObtaionIcon} fill="currentColor" />}
          >
            数据获取
          </Menu.Item>
          <Menu.Item
            key="/share/provide/list"
            icon={<IconBase icon={DataProvideIcon} fill="currentColor" />}
          >
            数据提供
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default connect()(SharePage);
