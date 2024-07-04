import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Alert, message, Tooltip } from 'quanta-design';
import { Select } from 'antd';

function AddMemberModal(props) {
  const { visible = false, onCancel = null, gid = '', dispatch = null } = props;
  const [selectList, setSelectList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [list, setList] = useState([]);
  const initData = (params = '') => {
    dispatch({
      type: 'organization/search',
      payload: {
        groupId: gid,
        params,
      },
      callback: res => {
        setSelectList(res);
        setList(res);
      },
    });
  };

  const handleCancel = () => {
    setSelectList([]);
    setSelectedList([]);
    setList([]);
    onCancel();
  };

  useEffect(() => {
    if (visible) {
      initData();
    }
  }, [visible]);

  const handleSearch = async value => {
    const data = list.filter(item => item.name.includes(value) || item.tel.includes(value));
    setSelectList(data);
  };

  const onOk = () => {
    if (dispatch) {
      dispatch({
        type: 'organization/groupMemberAdd',
        payload: {
          groupId: gid,
          members: selectedList,
        },
        callback: () => {
          message.success('成员添加成功！');
          dispatch({
            type: 'organization/memberList',
            payload: {
              groupId: gid,
            },
          });
          handleCancel();
        },
      });
    }
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      title="添加成员"
      visible={visible}
      onCancel={handleCancel}
      onOk={onOk}
    >
      <Alert
        type="info"
        message={
          <span>
            添加规则：
            <br />
            1.一个部门可包含多个成员，一个用户可在多个部门内；
            <br />
            2.超管拥有所有权限；
            <br />
            3.部门管理员可在本部门添加、移除成员和创建子部门；
          </span>
        }
        showIcon
      />
      <Select
        onChange={e => setSelectedList(e)}
        mode="multiple"
        style={{ width: '100%', marginTop: 20, marginBottom: 150 }}
        placeholder="请输入用户姓名或手机号查找"
        filterOption={false}
        onSearch={handleSearch}
        showSearch
        allowClear
      >
        {(selectList || []).map(item => (
          <Select.Option key={item.mem_id} disabled={item.is_existed}>
            <Tooltip title={item.is_existed ? '该用户已添加' : ''}>
              {item.name}
              <span style={{ color: '#b7b7b7' }}>（{item.tel}）</span>
            </Tooltip>
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
}

export default connect()(AddMemberModal);
