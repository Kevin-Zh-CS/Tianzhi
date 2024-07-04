import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Modal, Alert, Tooltip } from 'quanta-design';
import _ from 'lodash';
import { TreeSelect, Tag } from 'antd';
import styles from './index.less';
import { searchMembers } from '@/services/resource';
import { getDepartTree, memberList, groupList } from '@/services/organization';

function CreateQflUserModal(props) {
  const { visible, onOk, onCancel, namespace } = props;

  const [initialTreeData, setInitialTreeData] = useState([]);
  const [searchTreeData, setSearchTreeData] = useState([]);
  const [members, setMembers] = useState([]);
  const [value, setValue] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // eslint-disable-next-line consistent-return
  const findTreeNode = (data, key) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) return data[i];
      if (data[i].children?.length) {
        const treeNode = findTreeNode(data[i].children, key);
        if (treeNode) return treeNode;
      }
    }
  };

  const initData = (data, _members = members) =>
    data?.map(item => {
      const key = item.id || item.address;
      const total = item.total ?? item.amount;
      item.key = key;
      item.value = key;
      item.children = item.children || [];
      item.isLeaf = !(item.total > 0 || item.amount > 0 || item.children.length > 0);
      item.filter = item.name + item.tel;
      const member = _members.find(_item => _item.address === key);
      const title = item.tel ? `${item.name}（${item.tel}）` : `${item.name}·${total}人`;
      if (member.exist) {
        item.title = (
          <Tooltip title={`该${member.type === 1 ? '部门' : '成员'}已添加!`} placement="top">
            <div className={styles.title}>
              {title}
              <i className="iconfont icontishixing_duihao_morenx" />
            </div>
          </Tooltip>
        );
        item.disabled = true;
      } else {
        item.title = (
          <div className={styles.title}>
            {title}
            <i className="iconfont icontishixing_duihao_morenx" />
          </div>
        );
      }
      if (item.children?.length) {
        initData(item.children, _members);
      }
      return item;
    });

  const insertData = (_treeData, id, data) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < _treeData.length; i++) {
      if (_treeData[i].key === id) {
        _treeData[i].children = _treeData[i].children.concat(data);
        _treeData[i].load = true;
        return true;
      }
      if (_treeData[i].children?.length) {
        const flag = insertData(_treeData[i].children, id, data);
        if (flag) return true;
      }
    }
    return false;
  };

  const onTreeExpand = async _expandedKeys => {
    if (_expandedKeys.length > expandedKeys.length) {
      const key = _.difference(_expandedKeys, expandedKeys)[0];
      const _treeData = searchValue ? [...searchTreeData] : [...initialTreeData];
      const treeNode = findTreeNode(_treeData, key);
      if (!treeNode.load) {
        const groupId = treeNode.key;
        if (searchValue) {
          // 搜索条件下还需要加载子部门
          const _res = await groupList({ groupId });
          const departments = initData(_res);
          insertData(_treeData, groupId, departments);
        }
        const res = await memberList({ groupId, size: -1 });
        const _members = initData(res.members).map(item => {
          item.key = `${item.id}-${groupId}`; // 重新赋值key，防重复
          item.value = `${item.id}-${groupId}`; // 重新赋值key，防重复
          return item;
        });
        insertData(_treeData, groupId, _members);
        if (searchValue) {
          setSearchTreeData(_treeData);
        } else {
          setInitialTreeData(_treeData);
        }
      }
    }
    setExpandedKeys(_expandedKeys);
  };

  const onSearch = val => {
    const _members = JSON.parse(JSON.stringify(members)); // 防止对象引用
    const list = initData(
      _members.filter(item => item.name.includes(val) || item.tel?.includes(val)),
    );
    setSearchValue(val);
    setSearchTreeData(val ? list : []);
  };

  const tagRender = ({ value: _value, closable, onClose }) => {
    let title = '';
    const item = members.find(
      _item => _item.address === _value || _item.address === _value.split('-')[0],
    );
    if (item) title = item.tel ? `${item.name}` : `${item.name}·${item.amount}人`;
    return (
      <Tag closable={closable} onClose={onClose} style={{ margin: '2px 4px 2px 0' }}>
        {title}
      </Tag>
    );
  };

  const onChange = _value => {
    setValue(_value);
    if (searchValue) setExpandedKeys([]);
    onSearch('');
  };

  const init = async () => {
    const [res1, res2] = await Promise.all([getDepartTree(), searchMembers({ ns_id: namespace })]);
    const noDepartmentMembers = res2.filter(item => item.department === '暂无部门信息');
    setInitialTreeData(initData([...res1, ...noDepartmentMembers], res2));
    setMembers(res2);
  };

  useEffect(() => {
    if (visible) {
      init();
    } else {
      setInitialTreeData([]);
      setExpandedKeys([]);
    }
  }, [visible]);

  const handleOk = () => {
    onOk(value);
    setValue([]);
  };

  const handleCancel = () => {
    onCancel();
    setValue([]);
  };

  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      className={classnames(styles.createModal, 'modal-has-top-border')}
      title="添加成员"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      style={{ width: 560, margin: '0 auto', top: 240 }}
    >
      <Alert
        type="info"
        message={
          <span style={{ whiteSpace: 'pre-wrap' }}>
            {`添加规则：
1.联邦学习项目拥有者具有该任务下的所有权限；
2.首次添加的成员默认具有使用权限，进入成员列表可更改；
3.任务拥有者可为其他成员赋予管理权限，赋予其添加用户、移除用户等成员管理权限；
4.按部门添加的成员拥有一致的权限。`}
          </span>
        }
        showIcon
      />
      <TreeSelect
        treeData={searchValue ? searchTreeData : initialTreeData}
        treeExpandedKeys={expandedKeys}
        onTreeExpand={onTreeExpand}
        showSearch
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="请输入用户名/手机号/部门名称查找"
        allowClear
        multiple
        tagRender={tagRender}
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        onBlur={() => onSearch('')}
        filterTreeNode={false}
        dropdownClassName={styles.createModalTree}
        notFoundContent={<div className={styles.emptyBox}>当前机构暂无匹配结果！</div>}
      />
    </Modal>
  );
}

export default CreateQflUserModal;
