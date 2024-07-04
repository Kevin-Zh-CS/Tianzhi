import React from 'react';
import { IconBase, Menu } from 'quanta-design';
import './index.less';
import { ReactComponent as DataManageOverviewIcon } from '@/icons/data_manage_overview.svg';
import { ReactComponent as InnerRespositoryIcon } from '@/icons/inner_repository.svg';
import { ReactComponent as OuterRespositoryIcon } from '@/icons/outer_repository.svg';
import router from 'umi/router';

const { SubMenu } = Menu;
function ManagePage(props) {
  const { location } = props;
  const isManagePage = location.pathname.indexOf('/manage') !== -1;
  const isManageInnerSubmenuPage = location.pathname.indexOf('/manage/inner/repository/') !== -1;
  const isManageOuterSubmenuPage = location.pathname.indexOf('/manage/outer/repository/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/manage/inner/publish') !== -1) {
    selectedKeys = ['/manage/inner/publish'];
  } else if (location.pathname.indexOf('/manage/outer/obtain') !== -1) {
    selectedKeys = ['/manage/outer/obtain'];
  }

  const handleSelect = ({ key }) => {
    router.push({ pathname: key });
  };

  // const getDefaultOpenKeys = () => [
  //   location.pathname
  //     .split('/')
  //     .slice(0, 3)
  //     .join('/'),
  // ];

  const getDefaultOpenKeys = () => ['/manage/inner', '/manage/outer'];

  if (isManagePage && !isManageInnerSubmenuPage && !isManageOuterSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={getDefaultOpenKeys()}
          onClick={handleSelect}
        >
          <Menu.Item
            key="/manage/overview"
            icon={<IconBase icon={DataManageOverviewIcon} fill="currentColor" />}
          >
            数据管理概览
          </Menu.Item>
          <SubMenu
            key="/manage/inner"
            icon={<IconBase icon={InnerRespositoryIcon} fill="currentColor" />}
            title="内部资源管理"
          >
            <Menu.Item key="/manage/inner/repository">内部资源库</Menu.Item>
            <Menu.Item key="/manage/inner/publish">已发布数据</Menu.Item>
          </SubMenu>
          <SubMenu
            key="/manage/outer"
            icon={<IconBase icon={OuterRespositoryIcon} fill="currentColor" />}
            title="外部资源管理"
          >
            <Menu.Item key="/manage/outer/obtain">已获取数据</Menu.Item>
            <Menu.Item key="/manage/outer/repository">外部资源库</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
  }
  return null;
}

export default ManagePage;
