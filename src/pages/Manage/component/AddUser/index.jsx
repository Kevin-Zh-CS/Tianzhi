import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import {
  Button,
  IconBase,
  Tooltip,
  Popover,
  Icons,
  Dropdown,
  Menu,
  Input,
  message,
} from 'quanta-design';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
import List from 'rc-virtual-list';
import styles from './index.less';
import user from '@/assets/manage/user.png';
import userGroup from '@/assets/manage/userGroup.png';
import { PERMISSION } from '@/utils/enums';
import { getRoleSettingList } from '@/services/organization';
import { addMember, modifyMember } from '@/services/resource';

const { PlusIcon } = Icons;

function AddUser(props) {
  const { dispatch, namespace, resourceId, resourceMemberList, members, auth } = props;

  const [visible, setVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [roleList, setRoleList] = useState([]);

  const getList = async () => {
    const data = await getRoleSettingList(dispatch);
    setRoleList(data);
  };

  const getMemberList = () => {
    dispatch({
      type: 'resource/getResourceMemberList',
      payload: {
        ns_id: namespace,
        resource_id: resourceId,
        page: 1,
        size: 10,
      },
    });
  };

  useEffect(() => {
    setMemberList(members);
  }, [members]);

  useEffect(() => {
    if (visible) {
      getMemberList();
      getList();
    }
  }, [visible]);

  const handleSearch = (params = '') => {
    if (dispatch) {
      dispatch({
        type: 'resource/searchMembers',
        payload: {
          resourceId,
          ns_id: namespace,
          keywords: encodeURIComponent(params),
        },
      });
    }
  };

  const handleVisibleChange = _visible => {
    setVisible(_visible);
  };

  useEffect(() => {
    if (addVisible) {
      handleSearch();
    }
  }, [addVisible]);

  const handleAddVisibleChange = _visible => {
    setAddVisible(_visible);
    if (!_visible) setSearchVal('');
  };

  const handleMemberClick = async item => {
    if (item.exist) return;
    await addMember({
      resource_id: resourceId,
      ns_id: namespace,
      members: [item.address],
    });
    message.success('成员添加成功！');
    getMemberList();
    setSearchVal('');
    setAddVisible(false);
  };

  const handleSearchData = e => {
    const val = e.target.value;
    setSearchVal(val);
    const list = members.filter(
      item =>
        item.name.includes(val) ||
        (item.department !== '暂无部门信息' && item.department?.includes(val)),
    );
    setMemberList(list);
  };

  const popAddMember = (
    <div className={styles.popAddMember}>
      <div className={styles.popAddMemberSearch}>
        <Input
          placeholder="请输入用户姓名或部门名称查找"
          onChange={handleSearchData}
          value={searchVal}
        />
      </div>
      {memberList.length ? (
        <List data={memberList} height={248} itemKey="address" prefixCls={styles.popAddMemberList}>
          {item => (
            <div
              className={classnames(styles.memberListItemBox, item.exist ? styles.disabled : '')}
              onClick={() => handleMemberClick(item)}
            >
              <Tooltip
                placement="top"
                title={!item.exist ? '' : item.type === 1 ? '该部门已添加！' : '该成员已添加！'}
              >
                <div className={styles.memberListItem}>
                  <img src={item.type === 1 ? userGroup : user} alt="" className={styles.avatar} />
                  <div className={styles.info}>
                    <p className={styles.name}>{item.name}</p>
                    <p className={styles.department}>{item.department}</p>
                  </div>
                </div>
              </Tooltip>
            </div>
          )}
        </List>
      ) : (
        <div className={styles.noData}>当前机构未找到该用户！</div>
      )}
    </div>
  );

  const handleSelect = async (key, item) => {
    await modifyMember({
      ns_id: namespace,
      address: item.address,
      role: key === '4' ? '' : Number(key),
      resource_id: resourceId,
    });
    message.success(key === '4' ? '成员移除成功！' : '成员权限修改成功！');
    getMemberList();
  };

  const getRole = (list, role) => {
    const role_name = list.filter(item => item.id === role);
    return role_name.length ? role_name[0]?.display_name : '';
  };

  const menuRender = member => (
    <Menu onClick={({ key }) => handleSelect(key, member)}>
      {roleList
        .filter(li => li.id !== 0)
        .map(item => (
          <Menu.Item key={item.id} disabled={!member.role_range.includes(item.id)}>
            <span>{item.display_name}</span>
          </Menu.Item>
        ))}
      {!auth.includes(PERMISSION.member_manage) || member.role === 0 ? null : (
        <Menu.Item key={4}>
          <span>移除</span>
        </Menu.Item>
      )}
    </Menu>
  );

  const popMember = (
    <div className={styles.popMember}>
      <div className={styles.popMemberHeader}>
        <span className={styles.title}>资源成员</span>
        {auth.includes(PERMISSION.member_manage) && (
          <Popover
            placement="bottomRight"
            content={popAddMember}
            trigger="click"
            overlayClassName={styles.popAddMemberContainer}
            visible={addVisible}
            onVisibleChange={handleAddVisibleChange}
          >
            <Button type="primary" icon={<PlusIcon fill="#fff" />}>
              添加成员
            </Button>
          </Popover>
        )}
      </div>
      <List data={resourceMemberList} height={310} itemKey="address" prefixCls={styles.memberList}>
        {item => (
          <div className={styles.memberListItem}>
            <div className={styles.left}>
              <img src={item.type === 1 ? userGroup : user} alt="" className={styles.avatar} />
              <div className={styles.info}>
                <p className={styles.name}>
                  <span>{item.name}</span>
                  <span>{item.department}</span>
                </p>
                <Tooltip
                  placement="topRight"
                  title={item.authFrom.length > 10 ? item.authFrom : ''}
                >
                  <p className={styles.permission}>
                    {item.authFrom ? `权限继承自：${item.authFrom}` : `仅当前资源`}
                  </p>
                </Tooltip>
              </div>
            </div>
            <Dropdown
              overlay={
                auth.includes(PERMISSION.member_manage) ||
                auth.includes(PERMISSION.edit_member_role)
                  ? menuRender(item)
                  : null
              }
              trigger={['click']}
              disabled={
                !auth.includes(PERMISSION.member_manage) &&
                !auth.includes(PERMISSION.edit_member_role)
              }
            >
              <div
                className={classnames(
                  styles.right,
                  !auth.includes(PERMISSION.member_manage) &&
                    !auth.includes(PERMISSION.edit_member_role)
                    ? styles.rightDisabled
                    : '',
                )}
                onClick={e => e.preventDefault()}
              >
                <span className={styles.role}>{getRole(roleList, item.role)}</span>
                <i className="iconfont iconxfangxiangxing_danxianjiantou_xia" />
              </div>
            </Dropdown>
          </div>
        )}
      </List>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      content={popMember}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlayClassName={styles.popMemberContainer}
    >
      <Button icon={<IconBase icon={UserGroupIcon} fill="#888888" />} />
    </Popover>
  );
}

export default connect(({ resource }) => ({
  resourceMemberList: resource.resourceMemberList,
  members: resource.members,
}))(AddUser);
