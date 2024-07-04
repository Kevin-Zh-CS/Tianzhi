import React, { useEffect, useState } from 'react';
import { IconBase, Menu, Select, Icons } from 'quanta-design';
import './index.less';
import { ReactComponent as projectManageIcon } from '@/icons/project_manage.svg';
import { getProjectList } from '@/services/qfl';
import router from 'umi/router';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';

const { ArrowLeftIcon } = Icons;
function QflDetailPage(props) {
  const { location, collapsed } = props;
  const [list, setList] = useState([]);
  const isQflSponsorSubmenuPage = location.pathname.indexOf('/qfl/sponsor/project/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/qfl/sponsor/project/detail') !== -1) {
    selectedKeys = ['/qfl/sponsor/project/detail'];
  }

  if (location.pathname.indexOf('/qfl/sponsor/project/member') !== -1) {
    selectedKeys = ['/qfl/sponsor/project/member'];
  }

  const getTaskList = async () => {
    const res = await getProjectList({ page: 1, size: 1000, is_asc: false });

    setList(res.project_list);
  };
  useEffect(() => {
    // /qfl/sponsor/project/member
    if (location.pathname.indexOf('/qfl/sponsor/project') !== -1) {
      getTaskList();
    }
  }, [location.pathname]);

  const handleSelect = ({ key }) => {
    router.push({ pathname: key, query: { projectId: location.query.projectId } });
  };

  if (isQflSponsorSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <div className="quanta-sider-menu-item-back">
          <ArrowLeftIcon
            fill="#888888"
            showHover
            fontSize={24}
            onClick={() => router.push('/qfl/sponsor/repository')}
          />
          {!collapsed && (
            <div>
              <Select
                style={{ width: 150 }}
                placeholder="请选择"
                defaultValue={location.query.projectId}
                onChange={value => {
                  router.push(`/qfl/sponsor/project/detail?projectId=${value}`);
                  window.location.reload(true);
                }}
                bordered={false}
              >
                {list.map(item => (
                  <Select.Option key={item.project_info.project_id}>
                    {item.project_info.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <Menu mode="inline" onClick={handleSelect} selectedKeys={selectedKeys}>
          <Menu.Item
            key="/qfl/sponsor/project/detail"
            icon={<IconBase icon={projectManageIcon} fill="currentColor" />}
          >
            项目详情
          </Menu.Item>
          <Menu.Item
            key="/qfl/sponsor/project/member"
            params={{ projectId: location.query.projectId }}
            icon={<IconBase icon={UserGroupIcon} fill="currentColor" />}
          >
            成员管理
          </Menu.Item>
        </Menu>
      </div>
    );
  }
  return null;
}

export default QflDetailPage;
