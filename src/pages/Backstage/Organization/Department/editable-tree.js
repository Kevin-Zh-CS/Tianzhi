import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { IconBase, Input, Dropdown, Menu, Modal, Tooltip } from 'quanta-design';
import { Tree } from 'antd';
import _ from 'lodash';
import styles from '@/pages/Backstage/Organization/Department/index.less';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { ReactComponent as DepartmentIcon } from '@/icons/department.svg';
import WithLoading from '@/components/WithLoading';

const { DirectoryTree } = Tree;

function EditableTree(props) {
  const {
    onAdd = null,
    onDelete = null,
    onEdit = null,
    onSelect = null,
    treeData = [],
    isAdmin,
    style,
  } = props;

  const [renderTreeData, setRenderTreeData] = useState(treeData);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const refreshData = data =>
    data.map(item => {
      item.hover = item.hover || false;
      if (item.children.length) {
        refreshData(item.children);
      }
      return item;
    });

  useEffect(() => {
    setRenderTreeData(refreshData(treeData));
  }, [treeData]);

  const onExpand = _expandedKeys => {
    const _selectedKeys =
      _expandedKeys.length > expandedKeys.length
        ? _.difference(_expandedKeys, expandedKeys)
        : _.difference(expandedKeys, _expandedKeys);
    onSelect(_selectedKeys);
    setExpandedKeys(_expandedKeys);
  };

  const handleSubNew = (e, item) => {
    if (!item.children) {
      item.children = [];
    }
    if (item.children[0]?.isNew) {
      return;
    }
    onExpand(expandedKeys.concat([item.id]));
    item.children.unshift({ isNew: true, parentId: item.id, children: [] });
    setRenderTreeData([].concat(renderTreeData));
  };

  const handleDeleteModel = item => {
    Modal.info({
      title: `确认删除${item.title}吗？`,
      content: '删除后，部门内所有成员将不再拥有该部门已配置的所有权限。',
      okText: ' 取消 ',
      cancelText: '确定',
      onCancel: () => {
        onDelete(item.id);
      },
    });
  };

  const handleAdd = (e, item) => {
    setRenderTreeData([].concat(renderTreeData));
    onAdd(e.target.value, item.parentId);
  };

  const handleInputChange = (e, item) => {
    item.title = e.target.value;
    // item.isNew = true;
  };

  const handleMouseEnterItem = item => {
    // refreshData(renderTreeData);
    item.hover = true;
    setRenderTreeData([].concat(renderTreeData));
  };

  const handleMouseLeaveItem = item => {
    item.hover = false;
    setRenderTreeData([].concat(renderTreeData));
  };

  const titleRender = item => (
    <div
      className={`${styles.titleRender} hover-style`}
      onMouseEnter={() => {
        handleMouseEnterItem(item);
      }}
      onMouseLeave={() => {
        handleMouseLeaveItem(item);
      }}
    >
      <IconBase
        fill="#0076D9"
        className={styles.td}
        icon={DepartmentIcon}
        style={{ marginRight: 8 }}
      />
      {!item.isNew && !item.rename && (
        <Tooltip placement="top" title={item.title.length > 10 ? item.title : ''}>
          <div className={styles.title}>{item.title}</div>
        </Tooltip>
      )}
      {item.isNew && (
        <Input
          autoFocus
          onClick={e => e.stopPropagation()}
          onFocus={e => e.target.select()}
          onChange={e => {
            handleInputChange(e, item);
          }}
          onPressEnter={e => e.target.blur()}
          onBlur={e => handleAdd(e, item)}
          style={{ width: 200 }}
          defaultValue="未命名部门"
        />
      )}
      {item.rename && (
        <Input
          autoFocus
          onClick={e => e.stopPropagation()}
          onFocus={e => e.target.select()}
          onChange={e => {
            handleInputChange(e, item);
          }}
          onPressEnter={e => e.target.blur()}
          onBlur={e => onEdit(e.target.value, item.id)}
          style={{ width: 200 }}
          defaultValue={item.title}
        />
      )}
      {!item.isNew && !item.rename && item.hover && !item.disabled && isAdmin ? (
        <div onClick={e => e.stopPropagation()} className={styles.dropContainer}>
          {!item.org && (
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item onClick={e => handleSubNew(e, item)}>新建子部门</Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      item.rename = true;
                    }}
                  >
                    重命名
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      handleDeleteModel(item);
                    }}
                  >
                    删除
                  </Menu.Item>
                </Menu>
              }
            >
              <IconBase icon={MoreIcon} />
            </Dropdown>
          )}
        </div>
      ) : (
        <div className={styles.empty}></div>
      )}
    </div>
  );

  return (
    <div style={style}>
      <DirectoryTree
        {...props}
        treeData={renderTreeData}
        titleRender={titleRender}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
      />
    </div>
  );
}

export default connect()(WithLoading(EditableTree, { skeletonTemplate: 2 }));
