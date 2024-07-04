import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { IconBase, Alert, Button, Icons, Input, Table, Modal, message } from 'quanta-design';
import moment from 'moment';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import styles from './index.less';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';
import { ReactComponent as OwnerIcon } from '@/icons/owner.svg';
import { ReactComponent as ManagerIcon } from '@/icons/manager.svg';
import { ReactComponent as MemberIcon } from '@/icons/member.svg';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
// import useAuth from '@/pages/Manage/Inner/component/useAuth';
import Page from '@/components/Page';
import UpdateUserModal from '@/pages/Manage/component/UpdateUserModal';
import CreateQflUserModal from '@/pages/Qfl/componments/CreateQflUserModal';
import { addMember, modifyMember, getMemberList } from '@/services/resource';
import { getRoleSettingList } from '@/services/organization';

const { PlusIcon } = Icons;
const roleMap = [OwnerIcon, ManagerIcon, MemberIcon, UserGroupIcon];

function QflMember(props) {
  const { location, dispatch } = props;
  const { projectId } = location.query;
  const [showAlert, setShowAlert] = useState(true);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [modifyVisible, setModifyVisible] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updateUser, setUpdateUser] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [namespaceMemberList, setMemberList] = useState([]);
  const [total, setTotal] = useState(0);
  const [roleList, setRoleList] = useState([]);

  const getList = async () => {
    const data = await getRoleSettingList(dispatch);
    setRoleList(data);
  };
  // const auth = useAuth({ ns_id: projectId });
  const auth = [
    'qfl_restart_task',
    'add-members',
    'qfl_delete_task',
    'qfl_stop_task',
    'qfl_create_task',
    'qfl_add_participant',
    'qfl_remove_participant',
    'qfl_remove_data',
    'qfl_add_data',
    'qfl_modify_project',
    'qfl_modify_project',
    'add-members',
  ];

  const initMemberList = async ({
    page = 1,
    size = 10,
    keywords = '',
    is_time_desc = sortOrder ? sortOrder === 'descend' : null,
  } = {}) => {
    setCurrent(page);
    setPageSize(size);
    setSearchVal(keywords);
    try {
      setLoading(true);
      const data = await getMemberList({
        ns_id: projectId,
        page,
        size,
        keywords,
        is_time_desc,
      });
      setMemberList(data.member_list);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initMemberList();
    getList();
  }, []);

  const onTableChange = (pagination, filters, sorter) => {
    initMemberList({
      page: pagination.current,
      size: pagination.pageSize,
      is_time_desc: sorter.order ? sorter.order === 'descend' : null,
      keywords: searchVal,
    });
    setSortOrder(sorter.order);
  };

  const modifyMembers = () => {
    initMemberList({ size: pageSize });
    setModifyVisible(false);
  };

  const handleSearch = val => {
    initMemberList({ keywords: val });
  };

  const handleCreateUserOk = async val => {
    const _members = Array.from(new Set(val.map(item => item.split('-')[0])));
    if (_members.length) {
      const params = {
        ns_id: projectId,
        members: _members,
        resource_id: '',
      };
      await addMember(params);
      message.success('项目成员添加成功！');
      initMemberList();
      setAddMemberVisible(false);
    } else {
      setAddMemberVisible(false);
    }
  };

  const handleDelete = record => {
    Modal.info({
      title: `确认移除${record.name}吗？`,
      content: '移除后，该成员将不能使用当前项目。',
      style: { top: 240 },
      onOk: async () => {
        await modifyMember({
          ns_id: projectId,
          address: record.address,
          resource_id: '',
        });
        message.success('成员移除成功！');
        initMemberList({ size: pageSize });
        Modal.destroyAll();
      },
    });
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
                  1.联邦学习项目的拥有者可以进行成员管理，包括添加成员、移除成员、修改成员角色，并指定管理员共同管理；
                  <br />
                  2.目前暂不支持任务成员主动退出联邦学习项目。
                </span>
              }
              showIcon
            />
          </>
        ) : null
      }
    >
      <div className={styles.buttonWrap}>
        {auth.includes('add-members') && (
          <Button
            type="primary"
            icon={<PlusIcon fill="#fff" />}
            onClick={() => setAddMemberVisible(true)}
          >
            添加成员
          </Button>
        )}
        <div>
          <Input.Search
            style={{ width: 320, height: 32 }}
            placeholder="请输入用户名或手机号搜索"
            onSearch={handleSearch}
          />
        </div>
      </div>
      <Table
        loading={loading}
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
            title: '权限范围',
            dataIndex: 'role',
            key: 'role',
            render: (_, item) => <span>{MANAGE_ROLE_LIST_TYPE[item.role]}</span>,
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
            render: (_, record) =>
              record.role_range && record.role_range.length ? (
                <>
                  {[1, 2].some(_item => record.role_range.includes(_item)) && (
                    <a
                      onClick={() => {
                        setModifyVisible(true);
                        setUpdateUser(record);
                      }}
                    >
                      修改
                    </a>
                  )}
                  {record.role_range.includes(4) && (
                    <a style={{ marginLeft: 24 }} onClick={() => handleDelete(record)}>
                      移除
                    </a>
                  )}
                </>
              ) : (
                '-'
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
      />
      <CreateQflUserModal
        visible={addMemberVisible}
        namespace={projectId}
        onOk={handleCreateUserOk}
        onCancel={() => {
          setAddMemberVisible(false);
        }}
      />
      <UpdateUserModal
        type="task"
        roleList={roleList}
        updateUser={updateUser}
        namespace={projectId}
        visible={modifyVisible}
        onOk={modifyMembers}
        onCancel={() => {
          setModifyVisible(false);
        }}
      />
      {/* <AddRoleModal visible={addRoleVisible} onCancel={() => setAddRoleVisible(false)} /> */}
    </Page>
  );
}

export default connect(({ resource }) => ({
  namespaceMemberList: resource.namespaceMemberList.member_list,
  total: resource.namespaceMemberList.total,
}))(QflMember);
