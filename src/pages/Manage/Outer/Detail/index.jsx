import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Alert, IconBase, Tabs, Button, Icons, Input, message, Table, Modal } from 'quanta-design';
import Page from '@/components/Page';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import ResourceInfo from './ResourceInfo';
import styles from './index.less';
import { outerResourceInfo } from '@/services/outer';
import CreateUserModal from '@/pages/Manage/component/CreateUserModal';
import UpdateUserModal from '@/pages/Manage/component/UpdateUserModal';
import moment from 'moment';
import useAuth from '@/pages/Manage/Inner/component/useAuth';
import { MANAGE_ROLE_LIST_TYPE } from '@/constant/public';
import { ReactComponent as OwnerIcon } from '@/icons/owner.svg';
import { ReactComponent as ManagerIcon } from '@/icons/manager.svg';
import { ReactComponent as MemberIcon } from '@/icons/member.svg';
import { ReactComponent as UserGroupIcon } from '@/icons/user_group.svg';
import WithLoading from '@/components/WithLoading';
import { PERMISSION } from '@/utils/enums';
import { getRoleSettingList } from '@/services/organization';

const { TabPane } = Tabs;
const { PlusIcon } = Icons;
const roleMap = [OwnerIcon, ManagerIcon, MemberIcon, UserGroupIcon];

function Detail(props) {
  const { dispatch, location, namespaceMemberList, total, loading } = props;
  const { namespace } = location.query;
  const [info, setInfo] = useState({});
  const [showAlert, setShowAlert] = useState(true);
  const [updateUserVisible, setUpdateUserVisible] = useState(false);
  const [createUserVisible, setCreateUserVisible] = useState(false);
  const [updateUser, setUpdateUser] = useState({});
  const [activeKey, setActiveKey] = useState('1');
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchVal, setSearchVal] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [roleList, setRoleList] = useState([]);
  const getList = async () => {
    const data = await getRoleSettingList(dispatch);
    setRoleList(data);
  };

  const auth = useAuth({ ns_id: namespace });

  const getInfo = async () => {
    const data = await outerResourceInfo(namespace, dispatch);
    setInfo(data);
  };

  useEffect(() => {
    getInfo();
    getList();
  }, []);

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
        ns_id: namespace,
        page,
        size,
        keywords,
        is_time_desc,
      },
    });
  };

  useEffect(() => {
    if (activeKey === '2') {
      getMemberList();
    }
  }, [activeKey]);

  const deleteMember = item => {
    Modal.info({
      title: `确认移除${item.name}吗？`,
      content: '移除后，该成员将不能使用当前资源库。',
      style: { top: 240 },
      onOk: () => {
        dispatch({
          type: 'resource/modifyMember',
          payload: {
            ns_id: namespace,
            address: item.address,
          },
          callback: () => {
            message.success('成员移除成功！');
            getMemberList({ page: 1, size: pageSize });
          },
        });
      },
    });
  };

  const modifyMember = () => {
    getMemberList({ page: 1, size: pageSize });
    setUpdateUserVisible(false);
  };

  const columns = [
    {
      title: '用户姓名',
      dataIndex: 'name',
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
      sorter: true,
      sortOrder,
      render: text => <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      dataIndex: 'other',
      render: (_, item) => (
        <>
          {[1, 2].some(_item => item.role_range.includes(_item)) &&
            auth.includes(PERMISSION.edit_member_role) && (
              <div
                className="operate"
                onClick={() => {
                  setUpdateUserVisible(true);
                  setUpdateUser(item);
                }}
              >
                修改
              </div>
            )}
          {item.role_range.includes(4) && auth.includes(PERMISSION.member_manage) && (
            <div className="operate" onClick={() => deleteMember(item)}>
              移除
            </div>
          )}
        </>
      ),
    },
  ];

  const onTableChange = (pagination, filters, sorter) => {
    getMemberList({
      page: pagination.current,
      size: pagination.pageSize,
      is_time_desc: sorter.order ? sorter.order === 'descend' : null,
      keywords: searchVal,
    });
    setSortOrder(sorter.order);
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
          ns_id: namespace,
          members: _members,
        },
        callback: () => {
          message.success('资源库成员添加成功！');
          getMemberList();
          setCreateUserVisible(false);
        },
      });
    } else {
      setCreateUserVisible(false);
    }
  };

  return (
    <div>
      <Page
        title="资源库信息"
        extra={
          <div
            className="alert-trigger-wrap"
            onClick={() => {
              setShowAlert(!showAlert);
            }}
          >
            资源库信息编辑规则
            <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
          </div>
        }
        alert={
          showAlert ? (
            <>
              <Alert
                type="info"
                message={
                  <>
                    <div className={styles.message}>资源库信息编辑规则</div>
                    <div className={styles.messageFont}>
                      {`1.创建资源库的用户即为该资源库的拥有者，拥有者可以维护资源库的基本信息、添加用户、移除用户、授予管理员权限以及管理资源库下的所有资源；
2.资源库的拥有者可以指定管理员，管理员可以添加用户、移除用户、查看资源库下的所有资源。`}
                    </div>
                  </>
                }
                showIcon
              />
            </>
          ) : null
        }
        noContentLayout
      ></Page>
      <div className={styles.contentWrap}>
        <Tabs activeKey={activeKey} onChange={setActiveKey} tabBarStyle={{ padding: '0px 20px 0' }}>
          <TabPane tab="基本信息" key="1">
            <ResourceInfo loadData={getInfo} namespace={namespace} info={info} auth={auth} />
          </TabPane>
          <TabPane tab="资源库成员" key="2">
            <div className={styles.tabPaneWrap}>
              <div className={styles.btnWrap}>
                {auth.includes(PERMISSION.member_manage) && (
                  <Button
                    type="primary"
                    icon={<PlusIcon fill="#fff" />}
                    onClick={() => setCreateUserVisible(true)}
                  >
                    添加成员
                  </Button>
                )}
                <div className={styles.btnSearch}>
                  <Input.Search
                    style={{ width: 320 }}
                    placeholder="请输入用户名或手机号搜索"
                    onSearch={handleSearch}
                  />
                </div>
              </div>
              <Table
                style={{ marginTop: 14 }}
                columns={columns}
                dataSource={namespaceMemberList}
                rowKey="id"
                onChange={onTableChange}
                pagination={{
                  total,
                  current,
                  pageSize,
                }}
                emptyTableText={<div>暂无数据～</div>}
                loading={{
                  spinning: loading,
                }}
              />
            </div>
            <CreateUserModal
              visible={createUserVisible}
              namespace={namespace}
              onOk={handleCreateUserOk}
              onCancel={() => {
                setCreateUserVisible(false);
              }}
            />
            <UpdateUserModal
              roleList={roleList}
              updateUser={updateUser}
              namespace={namespace}
              visible={updateUserVisible}
              onOk={modifyMember}
              onCancel={() => {
                setUpdateUserVisible(false);
              }}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default connect(({ resource, loading }) => ({
  namespaceMemberList: resource.namespaceMemberList.member_list,
  total: resource.namespaceMemberList.total,
  loading: loading.effects['resource/getNamespaceMemberList'],
}))(WithLoading(Detail));
