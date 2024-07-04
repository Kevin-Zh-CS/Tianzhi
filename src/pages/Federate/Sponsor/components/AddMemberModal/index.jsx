import React, { useState } from 'react';
import { Modal, Alert, Input, Icons } from 'quanta-design';
import styles from './index.less';

const { CaretRightIcon, CaretDownIcon } = Icons;
const departmentList = [
  {
    name: '数据网格实验室',
    number: 66,
    isExist: true,
  },
  {
    name: '数据网格实验室',
    number: 66,
    isExist: false,
  },
];

function AddMemberModal(props) {
  const { visible, onCancel, onOk } = props;
  const [showDepartment, setShowDepartment] = useState(true);

  const renderDepartmentList = departmentList.map(item => (
    <div className={`${styles.departmentTitle} ${item.isExist ? 'disabled-style' : 'hover-style'}`}>
      <span>
        {item.name}·{item.number}
      </span>
      {item.isExist ? <span>已加入</span> : null}
    </div>
  ));

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="添加成员"
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Alert
        type="info"
        message={
          <span>
            添加成员规则：
            <br />
            1.拥有者可以添加用户、移除用户、授予管理员权限，首次添加的成员都默认为用户，进入成员列表可更改角色；
            <br />
            2.管理员可以添加用户、移除用户；
            <br />
            3.除资源库拥有者外，资源库其他成员可以退出资源库；
            <br />
            4.按部门添加的成员拥有一致的用户角色。
          </span>
        }
        showIcon
      />
      <Input style={{ marginTop: 20 }} placeholder="请输入用户姓名或手机号查找" />
      <>
        <div
          className={`${styles.departmentTitle} hover-style`}
          onClick={() => setShowDepartment(!showDepartment)}
        >
          按部门添加 {showDepartment ? <CaretDownIcon /> : <CaretRightIcon />}
        </div>
        {showDepartment ? <div style={{ margin: '0 12px' }}>{renderDepartmentList}</div> : null}
      </>
    </Modal>
  );
}

export default AddMemberModal;
