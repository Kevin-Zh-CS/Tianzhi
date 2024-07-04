import React from 'react';
import { IconBase, Icons, Menu, Select } from 'quanta-design';
import './index.less';
import router from 'umi/router';
import { connect } from 'dva';
import { ReactComponent as RepositoryInfoIcon } from '@/icons/repository_info.svg';
import { ReactComponent as FileManageIcon } from '@/icons/file_manage.svg';
import { ReactComponent as ModalManageIcon } from '@/icons/modal_manage.svg';
import { ReactComponent as InterfaceManageIcon } from '@/icons/interface_manage.svg';
import { ReactComponent as DataOriginManageIcon } from '@/icons/data_origin_manage.svg';
import { ReactComponent as DatabaseManageIcon } from '@/icons/database_manage.svg';
import { ReactComponent as DataImportIcon } from '@/icons/data_import.svg';

const { ArrowLeftIcon } = Icons;
function ManageInnerPage(props) {
  const { location, resourceList, collapsed } = props;
  const isManageInnerSubmenuPage = location.pathname.indexOf('/manage/inner/repository/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/manage/inner/repository/file') !== -1) {
    selectedKeys = ['/manage/inner/repository/file'];
  } else if (location.pathname.indexOf('/manage/inner/repository/model') !== -1) {
    selectedKeys = ['/manage/inner/repository/model'];
  } else if (location.pathname.indexOf('/manage/inner/repository/interface') !== -1) {
    selectedKeys = ['/manage/inner/repository/interface'];
  } else if (location.pathname.indexOf('/manage/inner/repository/origin') !== -1) {
    selectedKeys = ['/manage/inner/repository/origin'];
  } else if (location.pathname.indexOf('/manage/inner/repository/database') !== -1) {
    selectedKeys = ['/manage/inner/repository/database'];
  } else if (location.pathname.indexOf('/manage/inner/repository/import') !== -1) {
    selectedKeys = ['/manage/inner/repository/import'];
  }

  const handleSelect = ({ key }) => {
    router.push({ pathname: key, query: { namespace: location.query.namespace } });
  };

  if (isManageInnerSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <div className="quanta-sider-menu-item-back">
          <ArrowLeftIcon
            fill="#888888"
            showHover
            fontSize={24}
            onClick={() => router.push('/manage/inner/repository')}
          />
          {!collapsed && (
            <div>
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                defaultValue={location.query.namespace}
                onChange={value => {
                  router.push(`/manage/inner/repository/detail?namespace=${value}`);
                  window.location.reload(true);
                }}
                bordered={false}
              >
                {resourceList.map(item => (
                  <Select.Option key={item.ns_id} value={item.ns_id}>
                    {item.ns_name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <Menu mode="inline" onClick={handleSelect} selectedKeys={selectedKeys}>
          <Menu.Item
            key="/manage/inner/repository/detail"
            icon={<IconBase icon={RepositoryInfoIcon} fill="currentColor" />}
          >
            资源库信息
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/file"
            icon={<IconBase icon={FileManageIcon} fill="currentColor" />}
          >
            文件管理
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/model"
            icon={<IconBase icon={ModalManageIcon} fill="currentColor" />}
          >
            模型管理
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/interface"
            icon={<IconBase icon={InterfaceManageIcon} fill="currentColor" />}
          >
            接口管理
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/origin"
            icon={<IconBase icon={DataOriginManageIcon} fill="currentColor" />}
          >
            数据源管理
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/database"
            icon={<IconBase icon={DatabaseManageIcon} fill="currentColor" />}
          >
            数据库管理
          </Menu.Item>
          <Menu.Item
            key="/manage/inner/repository/import"
            icon={<IconBase icon={DataImportIcon} fill="currentColor" />}
          >
            数据导入
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default connect(({ resource }) => ({
  resourceList: resource.resourceList,
}))(ManageInnerPage);
