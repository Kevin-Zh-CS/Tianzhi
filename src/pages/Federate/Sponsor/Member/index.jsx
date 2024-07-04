import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { IconBase, Alert, Button, Icons, Input, Table, Modal, message } from 'quanta-design';
import Page from '@/components/Page';
import moment from 'moment';
// import AddMemberModal from '@/pages/Federate/Sponsor/components/AddMemberModal';
// import AddRoleModal from '@/pages/Federate/Sponsor/components/AddRoleModal';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import styles from './index.less';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';
import { ReactComponent as OwnerIcon } from '@/icons/owner.svg';
import { ReactComponent as ManagerIcon } from '@/icons/manager.svg';
import { ReactComponent as MemberIcon } from '@/icons/member.svg';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
import CreateUserModal from '@/pages/Manage/component/CreateUserModal';
import { PERMISSION } from '@/utils/enums';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import UpdateUserModal from '@/pages/Manage/component/UpdateUserModal';
import { getRoleSettingList } from '@/services/organization';

const { PlusIcon } = Icons;
const roleMap = [OwnerIcon, ManagerIcon, MemberIcon, UserGroupIcon];

function Member(props) {
  const { dispatch, location, namespaceMemberList, total, loading } = props;
  const { taskId } = location.query;
  const [showAlert, setShowAlert] = useState(true);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  // const [addRoleVisible, setAddRoleVisible] = useState(false);
  const [modifyVisible, setModifyVisible] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updateUser, setUpdateUser] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [roleList, setRoleList] = useState([]);
  const auth = useAuth({ ns_id: taskId });

  const getList = async () => {
    const data = await getRoleSettingList(dispatch);
    setRoleList(data);
  };

  const getMemberList = ({
    page = 1,
    size = 10,
    keywords = '',
    is_time_desc = sortOrder ? sortOrder === 'descend' : null,
  } = {}) => {
    setCurrent(page);
    setPageSize(size);
    setSearchVal(keywords);
    dispatch({
      type: 'resource/getNamespaceMemberList',
      payload: {
        ns_id: taskId,
        page,
        size,
        keywords,
        is_time_desc,
      },
    });
  };

  useEffect(() => {
    getMemberList();
    getList();
  }, []);

  const onTableChange = (pagination, filters, sorter) => {
    getMemberList({
      page: pagination.current,
      size: pagination.pageSize,
      is_time_desc: sorter.order ? sorter.order === 'descend' : null,
      keywords: searchVal,
    });
    setSortOrder(sorter.order);
  };

  const modifyMember = () => {
    getMemberList({ page: 1, size: pageSize });
    setModifyVisible(false);
  };

  const handleSearch = val => {
    getMemberList({ page: 1, size: 10, keywords: val });
  };

  const handleCreateUserOk = val => {
    const _members = Array.from(new Set(val.map(item => item.split('-')[0])));
    if (_members.length) {
      dispatch({
        type: 'resource/addMember',
        payload: {
          ns_id: taskId,
          members: _members,
        },
        callback: () => {
          message.success('资源库成员添加成功！');
          getMemberList();
          setAddMemberVisible(false);
        },
      });
    } else {
      setAddMemberVisible(false);
    }
  };

  return (
    <Page
      title="成员管理"
      extra={
        <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
          成员管理规则
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={
        showAlert ? (
          <>
            <Alert
              style={{ marginBottom: 12 }}
              type="info"
              message="成员管理规则"
              description={
                <span>
                  1.隐私计算任务的拥有者可以进行成员管理，包括添加成员、移除成员、修改成员角色，并指定管理员共同管理；
                  <br />
                  2.目前暂不支持任务成员主动退出隐私计算任务。
                </span>
              }
              showIcon
            />
          </>
        ) : null
      }
    >
      <div className={styles.buttonWrap}>
        {auth.includes(PERMISSION.member_manage) && (
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => setAddMemberVisible(true)}
          >
            添加成员
          </Button>
        )}
        <div>
          {/* <Button icon={<RefreshIcon />} onClick={() => {}} /> */}
          <Input.Search
            style={{ width: 320, height: 32, marginLeft: 12 }}
            placeholder="请输入用户名或手机号搜索"
            onSearch={handleSearch}
          />
        </div>
      </div>
      <Table
        columns={[
          {
            title: '用户姓名',
            dataIndex: 'name',
            key: 'name',
            render: (text, item) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconBase
                  icon={
                    roleMap[
                      MANAGE_ROLE_LIST_TYPE[item.role] !== '使用权限'
                        ? item.role
                        : item.type !== 1
                        ? 2
                        : 3
                    ]
                  }
                  style={{ marginRight: 10 }}
                />
                <span>{item.type !== 1 ? text : `${text}·${item.amount}人`}</span>
              </div>
            ),
          },
          {
            title: '手机号',
            dataIndex: 'tel',
            key: 'tel',
            render: text => <span>{text || '-'}</span>,
          },
          {
            title: '角色名称',
            dataIndex: 'role',
            key: 'role',
            render: text => {
              const data = roleList.filter(item => item.id === text);
              const role = data[0]?.display_name || '-';
              return role;
            },
          },
          {
            title: '添加时间',
            dataIndex: 'join_time',
            key: 'join_time',
            sorter: true,
            sortOrder,
            render: text => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
          },
          {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
              <>
                {[1, 2].some(_item => record.role_range.includes(_item)) &&
                  auth.includes(PERMISSION.edit_member_role) && (
                    <a
                      onClick={() => {
                        setModifyVisible(true);
                        setUpdateUser(record);
                      }}
                    >
                      修改
                    </a>
                  )}
                {record.role_range.includes(4) && auth.includes(PERMISSION.member_manage) && (
                  <a
                    style={{ marginLeft: 24 }}
                    onClick={() =>
                      Modal.info({
                        title: `确认移除${record.name}吗？`,
                        content: '移除后，该成员将不能使用当前任务。',
                        style: { top: 240 },
                        onOk: () => {
                          dispatch({
                            type: 'resource/modifyMember',
                            payload: {
                              ns_id: taskId,
                              address: record.address,
                            },
                            callback: () => {
                              message.success('成员移除成功！');
                              getMemberList({ page: 1, size: pageSize });
                            },
                          });
                        },
                      })
                    }
                  >
                    移除
                  </a>
                )}
              </>
            ),
          },
        ]}
        dataSource={namespaceMemberList}
        rowKey="id"
        onChange={onTableChange}
        pagination={{
          total,
          current,
          pageSize,
        }}
        loading={{
          spinning: loading,
        }}
      />
      <CreateUserModal
        type="task"
        visible={addMemberVisible}
        namespace={taskId}
        onOk={handleCreateUserOk}
        onCancel={() => {
          setAddMemberVisible(false);
        }}
      />
      <UpdateUserModal
        type="task"
        updateUser={updateUser}
        roleList={roleList}
        namespace={taskId}
        visible={modifyVisible}
        onOk={modifyMember}
        onCancel={() => {
          setModifyVisible(false);
        }}
      />
      {/* <AddRoleModal visible={addRoleVisible} onCancel={() => setAddRoleVisible(false)} /> */}
    </Page>
  );
}

export default connect(({ resource, loading }) => ({
  namespaceMemberList: resource.namespaceMemberList.member_list,
  total: resource.namespaceMemberList.total,
  loading: loading.effects['resource/getNamespaceMemberList'],
}))(Member);
