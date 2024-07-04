import React from 'react';
import { IconBase, Menu } from 'quanta-design';
import './index.less';
import { ReactComponent as OrgIcon } from '@/icons/organization.svg';
import { ReactComponent as BxIcon } from '@/icons/bx.svg';
import router from 'umi/router';
import { connect } from 'dva';

const { SubMenu } = Menu;
function BasicPage(props) {
  const { location, userInfo } = props;
  const isBackstageSubmenuPage = location.pathname.indexOf('/backstage') !== -1;
  let selectedKeys = location.pathname || '';

  const handleSelect = ({ key }) => {
    router.push({ pathname: key });
  };

  const getDefaultOpenKeys = ['/backstage/organization', '/backstage/credit'];

  if (location.pathname.indexOf('/backstage/organization/permission') !== -1) {
    selectedKeys = ['/backstage/organization/permission'];
  } else if (location.pathname.indexOf('/backstage/credit/settle') !== -1) {
    selectedKeys = ['/backstage/credit/settle'];
  } else if (location.pathname.indexOf('/backstage/credit/info') !== -1) {
    selectedKeys = ['/backstage/credit/info'];
  }

  if (isBackstageSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={getDefaultOpenKeys}
          onClick={handleSelect}
        >
          <SubMenu
            key="/backstage/organization"
            icon={<IconBase icon={OrgIcon} fill="currentColor" />}
            title="机构管理"
          >
            <Menu.Item key="/backstage/organization/info">机构信息</Menu.Item>
            <Menu.Item key="/backstage/organization/user">用户管理</Menu.Item>
            <Menu.Item key="/backstage/organization/department">部门管理</Menu.Item>
            <Menu.Item key="/backstage/organization/permission">权限管理</Menu.Item>
          </SubMenu>

          <SubMenu
            key="/backstage/credit"
            icon={<IconBase icon={BxIcon} fill="currentColor" />}
            title="积分管理"
          >
            <Menu.Item key="/backstage/credit/info">积分明细</Menu.Item>
            {userInfo.is_admin ? (
              <Menu.Item key="/backstage/credit/settle">积分清算</Menu.Item>
            ) : null}
          </SubMenu>
        </Menu>
      </div>
    );
  }
  return null;
}

export default connect(({ account }) => ({
  userInfo: account.info,
}))(BasicPage);
