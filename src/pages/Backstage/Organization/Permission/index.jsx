import React, { useState, useEffect } from 'react';
import { Table, IconBase, Alert } from 'quanta-design';
import Page from '@/components/Page';
import styles from './index.less';
import { ReactComponent as OwnerIcon } from '@/icons/owner.svg';
import { ReactComponent as ManagerIcon } from '@/icons/manager.svg';
import { ReactComponent as MemberIcon } from '@/icons/member.svg';
import { ReactComponent as ArrowsDown } from '@/icons/arrows_down.svg';
import { getRoleSettingList } from '@/services/organization';
import { connect } from 'dva';
import router from 'umi/router';
import WithLoading from '@/components/WithLoading';

function Permission(props) {
  const { userInfo, dispatch } = props;
  const [showAlert, setShowAlert] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const roleIcons = {
    owner: OwnerIcon,
    manager: ManagerIcon,
    member: MemberIcon,
  };

  const goToUpdate = record => {
    router.push(
      `/backstage/organization/permission/edit?id=${record.id}&role_name=${record.role_name}&displayName=${record.display_name}`,
    );
  };

  const goToDetail = record => {
    router.push(
      `/backstage/organization/permission/detail?id=${record.id}&role_name=${record.role_name}&displayName=${record.display_name}`,
    );
  };

  const getList = async () => {
    const data = await getRoleSettingList(dispatch);
    setRoleList(data);
  };

  useEffect(() => {
    getList();
  }, []);

  const getRoleList = (arr, record) => {
    const list = arr.filter(li => li.checked === 1 || li.checked === 2);
    return record.role_name === 'owner' && list.length === arr.length
      ? '所有权限'
      : list.map(item => item.display_name).join(' ');
  };

  const roleColumns = [
    {
      title: '角色名称',
      dataIndex: 'display_name',
      render: (text, render) => (
        <div style={{ display: 'flex' }}>
          <IconBase icon={roleIcons[render.role_name]} style={{ marginRight: 10 }} /> {text}
        </div>
      ),
    },
    {
      title: '权限配置',
      dataIndex: 'perm_settings',
      render: (arr, record) => getRoleList(arr, record),
    },
    {
      title: '操作',
      dataIndex: 'other',
      render: (_, record) => (
        <>
          <div
            className="operate"
            onClick={() => {
              goToDetail(record);
            }}
          >
            详情
          </div>
          {userInfo.is_admin ? (
            <div
              className="operate"
              onClick={() => {
                goToUpdate(record);
              }}
            >
              修改
            </div>
          ) : null}
        </>
      ),
    },
  ];

  const alert = (
    <Alert
      type="info"
      message="权限管理的功能定义：超级管理员可通过权限管理为不同的角色名称进行权限配置，从而控制不同用户对不同资源的访问、操作等权限。"
      showIcon
    />
  );

  return (
    <Page
      title="权限管理"
      noContentLayout
      className={styles.permissionPage}
      extra={
        <div className="alert-trigger-wrap" onClick={() => setShowAlert(!showAlert)}>
          权限管理使用说明
          <IconBase className={showAlert ? 'up' : 'down'} icon={ArrowsDown} fill="#888888" />
        </div>
      }
      alert={showAlert ? alert : null}
    >
      <div className={styles.tabPaneWrap}>
        <Table
          columns={roleColumns}
          dataSource={roleList}
          rowKey="id"
          pagination={false}
          emptyTableText={<div>暂无数据～</div>}
        />
      </div>
    </Page>
  );
}

export default connect(({ account, global }) => ({
  userInfo: account.info,
  loading: global.loading,
}))(WithLoading(Permission));
