import React from 'react';
import { IconBase, Icons, Menu, Select } from 'quanta-design';
import './index.less';
import router from 'umi/router';
import { ReactComponent as RepositoryInfoIcon } from '@/icons/repository_info.svg';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
import { connect } from 'dva';

const { ArrowLeftIcon } = Icons;
function FederateSponsorPage(props) {
  const { location, taskList, collapsed } = props;
  const isFederateSponsorSubmenuPage = location.pathname.indexOf('/federate/sponsor/') !== -1;
  let selectedKeys = location.pathname || '';
  if (location.pathname.indexOf('/federate/sponsor/member') !== -1) {
    selectedKeys = ['/federate/sponsor/member'];
  }

  const handleSelect = ({ key }) => {
    router.push({ pathname: key, query: { taskId: location.query.taskId } });
  };

  if (isFederateSponsorSubmenuPage) {
    return (
      <div className="quanta-sider-menu-item">
        <div className="quanta-sider-menu-item-back">
          <ArrowLeftIcon
            fill="#888888"
            showHover
            fontSize={24}
            onClick={() => router.push('/federate/sponsor')}
          />
          {!collapsed && (
            <Select
              style={{ width: 150 }}
              placeholder="请选择"
              defaultValue={location.query.taskId}
              onChange={value => {
                router.push(`/federate/sponsor/task?taskId=${value}`);
                window.location.reload(true);
              }}
              bordered={false}
            >
              {taskList.map(item => (
                <Select.Option key={item.task_info.task_id} value={item.task_info.task_id}>
                  {item.task_info.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
        <Menu mode="inline" onClick={handleSelect} selectedKeys={selectedKeys}>
          <Menu.Item
            key="/federate/sponsor/task"
            params={{ taskId: location.query.taskId }}
            icon={<IconBase icon={RepositoryInfoIcon} fill="currentColor" />}
          >
            任务管理
          </Menu.Item>
          <Menu.Item
            key="/federate/sponsor/member"
            params={{ taskId: location.query.taskId }}
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

export default connect(({ sponsor }) => ({
  taskList: sponsor.taskList,
}))(FederateSponsorPage);
