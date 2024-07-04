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

const { ArrowLeftIcon } = Icons;
function ManageOuterPage(props) {
  const { location, outerList, collapsed } = props;
  const isManageOuterSubmenuPage = location.pathname.indexOf('/manage/outer/repository/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/manage/outer/repository/file') !== -1) {
    selectedKeys = ['/manage/outer/repository/file'];
  } else if (location.pathname.indexOf('/manage/outer/repository/model') !== -1) {
    selectedKeys = ['/manage/outer/repository/model'];
  } else if (location.pathname.indexOf('/manage/outer/repository/interface') !== -1) {
    selectedKeys = ['/manage/outer/repository/interface'];
  } else if (location.pathname.indexOf('/manage/outer/repository/origin') !== -1) {
    selectedKeys = ['/manage/outer/repository/origin'];
  }

  const handleSelect = ({ key, item }) => {
    if (!item.props.index) {
      router.push({ pathname: key, query: { namespace: location.query.namespace } });
    } else {
      let type = item.props.index - 1;
      if (item.props.index === 3) {
        type = 1;
      } else if (item.props.index === 2) {
        type = 2;
      }
      router.push({
        pathname: key,
        query: { namespace: location.query.namespace, dataType: type },
      });
    }
  };

  if (isManageOuterSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <div className="quanta-sider-menu-item-back">
          <ArrowLeftIcon
            fill="#888888"
            showHover
            fontSize={24}
            onClick={() => router.push('/manage/outer/repository')}
          />
          {!collapsed && (
            <div>
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                defaultValue={location.query.namespace}
                onChange={value => {
                  router.push(`/manage/outer/repository/detail?namespace=${value}`);
                  window.location.reload(true);
                }}
                bordered={false}
              >
                {outerList.map(item => (
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
            key="/manage/outer/repository/detail"
            icon={<IconBase icon={RepositoryInfoIcon} fill="currentColor" />}
          >
            资源库信息
          </Menu.Item>
          <Menu.Item
            key="/manage/outer/repository/file"
            index={0}
            icon={<IconBase icon={FileManageIcon} fill="currentColor" />}
          >
            文件管理
          </Menu.Item>
          <Menu.Item
            key="/manage/outer/repository/model"
            icon={<IconBase icon={ModalManageIcon} fill="currentColor" />}
          >
            模型管理
          </Menu.Item>
          <Menu.Item
            key="/manage/outer/repository/interface"
            icon={<IconBase icon={InterfaceManageIcon} fill="currentColor" />}
          >
            接口管理
          </Menu.Item>
          <Menu.Item
            key="/manage/outer/repository/origin"
            icon={<IconBase icon={DataOriginManageIcon} fill="currentColor" />}
          >
            数据源管理
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default connect(({ outer }) => ({
  outerList: outer.outerList,
}))(ManageOuterPage);
