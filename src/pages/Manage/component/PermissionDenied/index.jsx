import React from 'react';
import styles from './index.less';
import permissionDenied from '@/assets/manage/permissionDenied.png';

const PermissionDenied = () => (
  <div className={styles.permissionDenied}>
    <div>
      <img alt="" src={permissionDenied} width={200} />
      <div className={styles.tips}>
        你没有该数据的访问权限，
        <br />
        请联系管理员
      </div>
    </div>
  </div>
);

export default PermissionDenied;
