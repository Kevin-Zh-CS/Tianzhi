import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { IconBase, Input, Dropdown, Menu, Modal, Icons } from 'quanta-design';
// import { ReactComponent as OrgIcon } from '@/icons/organization.svg';
import { ReactComponent as DepartmentIcon } from '@/icons/department.svg';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import styles from './index.less';

const { CaretDownIcon, CaretRightIcon } = Icons;

function Tree(props) {
  const {
    // isAdmin = false,
    submitNew = null,
    submitRename = null,
    submitDelete = null,
    onLoadData = null,
    treeData = [],
    selectKey = '',
    setSelectKey = null,
    rootData = {},
  } = props;
  const [renderTreeData, setRenderTreeData] = useState(treeData);
  const init = list =>
    list.map(item => {
      item.expand = item.expand || false;
      item.hover = item.hover || false;
      if (item.children?.length) {
        init(item.children);
      }
      return item;
    });

  const refreshData = data => {
    // eslint-disable-next-line
    data.map(item => {
      item.hover = false;
      if (item.children?.length) {
        refreshData(item.children);
      }
    });
  };
  useEffect(() => {
    const tmp = init(treeData);
    setRenderTreeData(tmp);
  }, [treeData]);

  const handleSubNew = (e, item) => {
    if (!item.children) {
      item.children = [];
    }
    if (item.children[0]?.isNew) {
      return;
    }
    item.children.unshift({ isNew: true, children: [] });
    item.expand = true;
    setRenderTreeData([].concat(renderTreeData));
  };

  const CaretIcon = ({ isOpen = false }) =>
    isOpen ? (
      <CaretDownIcon style={{ marginRight: 6 }} />
    ) : (
      <CaretRightIcon style={{ marginRight: 6 }} />
    );

  const handleClickItem = async item => {
    if (!item.children) {
      item.children = [];
    }
    if (!item?.children[0]?.isNew) {
      item.expand = !item.expand;
    }
    item.hover = true;
    setSelectKey(item.id);
    if (!item.children[0]?.isNew) {
      await onLoadData({ update: true, ...item });
    }
    setRenderTreeData([].concat(renderTreeData));
  };

  const handleMouseEnterItem = item => {
    refreshData(renderTreeData);
    item.hover = true;
    setRenderTreeData([].concat(renderTreeData));
  };

  const handleMouseLeaveItem = item => {
    item.hover = false;
    setRenderTreeData([].concat(renderTreeData));
  };

  const handlePressEnterInput = (item, e, root) => {
    item.name = e.target.value;
    item.isNew = false;
    setRenderTreeData([].concat(renderTreeData));
    submitNew(e, root);
  };

  const handleInputChange = (item, e) => {
    item.name = e.target.value;
    item.isNew = true;
  };

  useEffect(() => {
    function keyPress(e) {
      if (e.keyCode === 27) {
        onLoadData({ update: true, ...renderTreeData[0] });
      }
    }

    document.addEventListener('keydown', keyPress);
  }, [renderTreeData]);

  const handleDeleteModel = (item, root) => {
    Modal.info({
      title: `确认删除${item.name}吗？`,
      content: '删除后，部门内所有成员将不再拥有该部门已配置的所有权限。',
      okText: ' 取消 ',
      cancelText: '确定',
      onCancel: async () => {
        await submitDelete(item.id, root);
        // setRenderTreeData([].concat(renderTreeData));
      },
    });
  };

  const TreeChildren = ({ root = null, treeList = [], deep = 0 }) =>
    treeList.map(item => (
      <div key={item.id}>
        <div
          className={`${styles.treeItem} ${item.id === selectKey &&
            styles.treeItemActived} hover-style`}
          onMouseEnter={() => {
            handleMouseEnterItem(item);
          }}
          onMouseLeave={() => {
            handleMouseLeaveItem(item);
          }}
          onClick={() => {
            handleClickItem(item);
          }}
        >
          <div style={{ width: deep * 24 }}></div>
          <div style={{ marginLeft: deep * 24 }}>
            {item.children && item.children.length > 0 ? (
              <CaretIcon isOpen={item.expand} />
            ) : (
              <div style={{ marginRight: 28 }} />
            )}
          </div>
          <IconBase
            fill="#0076D9"
            className={styles.td}
            icon={DepartmentIcon}
            style={{ marginRight: 8 }}
          />
          {item.isNew && (
            <Input
              autoFocus
              onClick={e => e.stopPropagation()}
              onFocus={e => e.target.select()}
              onPressEnter={e => {
                handlePressEnterInput(item, e, root);
              }}
              onChange={e => {
                handleInputChange(item, e);
              }}
              onBlur={e => submitNew(e, root)}
              style={{ width: 200 }}
              defaultValue="未命名部门"
              maxLength={30}
            />
          )}
          {item.rename && (
            <Input
              autoFocus
              onClick={e => e.stopPropagation()}
              onFocus={e => e.target.select()}
              onPressEnter={e => submitRename(e, item.id, root)}
              onBlur={e => submitRename(e, item.id, root)}
              onChange={e => {
                item.name = e.target.value;
              }}
              defaultValue={item.name}
              maxLength={30}
              style={{ width: 200 }}
            />
          )}
          {!item.isNew && !item.rename && <span>{item.name}</span>}
          {!item.isNew && !item.rename && item.hover && (
            <span onClick={e => e.stopPropagation()} className={styles.dropContainer}>
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
                          handleDeleteModel(item, root);
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
            </span>
          )}
        </div>
        {item.children?.length && (item.org || item.expand) ? (
          <TreeChildren root={item} treeList={item.children} deep={deep + 1} />
        ) : null}
      </div>
    ));

  return (
    <div className={styles.leftContainer}>
      <div className={styles.left}>
        <div className={styles.treeWrap}>
          {<TreeChildren root={rootData} treeList={renderTreeData} deep={0} />}
        </div>
      </div>
    </div>
  );
}

export default connect()(Tree);
