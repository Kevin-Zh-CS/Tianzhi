import React, { useEffect, useState } from 'react';
import { Descriptions, Divider, Button } from 'quanta-design';
import Page from '@/components/NewPage';
import styles from './index.less';
import { getPermSetting } from '@/services/organization';
import { connect } from 'dva';
import WithLoading from '@/components/WithLoading';
import router from 'umi/router';

function PermissionDetail(props) {
  const { location, dispatch, userInfo } = props;
  const {
    query: { id, role_name, displayName },
  } = location;
  const [permissionList, setPermissionList] = useState([]);

  const handleInit = async () => {
    const data = await getPermSetting({ role_id: id, role_name }, dispatch);
    const displayData = data
      .filter(li => li.checked >= 1)
      .map(item => ({ ...item, desc: item.operations?.map(li => li.display_name).join(' ') }));
    setPermissionList(displayData);
  };

  useEffect(() => {
    handleInit();
  }, [id]);

  const handleEdit = () => {
    router.push(
      `/backstage/organization/permission/edit?id=${id}&role_name=${role_name}&displayName=${displayName}`,
    );
  };

  return (
    <Page
      showBackIcon
      extra={userInfo.is_admin ? <Button onClick={handleEdit}>修改</Button> : null}
      title="权限详情"
      noContentLayout
    >
      <div className={styles.detailPage}>
        <Descriptions title="基本信息">
          <Descriptions.Item label="角色名称">{displayName}</Descriptions.Item>
        </Descriptions>
        <div style={{ padding: '0 12px', width: 960 }}>
          <Divider style={{ margin: '8px 0 20px 0', borderTop: '1px dashed #E7E7E7' }} />
        </div>
        <Descriptions title="权限配置">
          <Descriptions.Item>
            <div className={styles.configDetail}>
              {permissionList.map(item => (
                <div className={styles.checkboxItem}>
                  <div>{item.display_name}</div>
                  <div className={styles.checkboxItemTxt}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Page>
  );
}

export default connect(({ global, account }) => ({
  userInfo: account.info,
  loading: global.loading,
}))(WithLoading(PermissionDetail));
