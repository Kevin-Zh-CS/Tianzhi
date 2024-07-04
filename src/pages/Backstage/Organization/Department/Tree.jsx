import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { IconBase, Input, Dropdown, Menu, Modal, Icons } from 'quanta-design';
import { ReactComponent as OrgIcon } from '@/icons/organization.svg';
import { ReactComponent as DepartmentIcon } from '@/icons/department.svg';
import { ReactComponent as MoreIcon } from '@/icons/more.svg';
import { Typography, Popover } from 'antd';
import styles from './index.less';

const { Paragraph } = Typography;
const { CaretDownIcon, CaretRightIcon, PlusIcon } = Icons;

function Tree(props) {
  const {
    isAdmin = false,
    submitNew = null,
    submitRename = null,
    submitDelete = null,
    onLoadData = null,
    treeData = [],
    selectKey = '',
    setSelectKey = null,
  } = props;
  const [renderTreeData, setRenderTreeData] = useState(treeData);
  const renameRef = useRef(null);
  const init = list =>
    list.map(item => {
      item.expand = item.expand || false;
      item.hover = false;
      if (item.child?.length) {
        init(item.child);
      }
      return item;
    });

  useEffect(() => {
    const tmp = init(treeData);
    setRenderTreeData(tmp);
  }, [treeData]);

  const handleSubNew = (e, item) => {
    if (!item.child) {
      item.child = [];
    }
    if (item.child[0]?.isNew) {
      return;
    }
    item.child.unshift({ isNew: true, child: [] });
    item.expand = true;
    setRenderTreeData([].concat(renderTreeData));
  };

  const CaretIcon = ({ isOpen = false }) =>
    isOpen ? (
      <CaretDownIcon style={{ marginRight: 6 }} />
    ) : (
      <CaretRightIcon style={{ marginRight: 6 }} />
    );

  const TreeChildren = ({ root = null, treeList = [], deep = 0 }) =>
    treeList.map(item => (
      <>
        <div
          className={`${styles.treeItem} ${item.key === selectKey &&
            styles.treeItemActived} hover-style`}
          onClick={() => {
            if (!item.child) {
              item.child = [];
            }
            if (!item?.child[0]?.isNew) {
              item.expand = !item.expand;
            }
            setSelectKey(item.key);
            if (!item.child[0]?.isNew) {
              onLoadData({ update: true, ...item });
            }
            setRenderTreeData([].concat(renderTreeData));
          }}
          onMouseEnter={() => {
            item.hover = true;
            setRenderTreeData([].concat(renderTreeData));
          }}
          onMouseLeave={() => {
            item.hover = false;
            setRenderTreeData([].concat(renderTreeData));
          }}
        >
          {!item.org && (
            <div style={{ display: 'flex', marginLeft: deep * 24 }}>
              {item.subDepart ? (
                <CaretIcon isOpen={item.expand} />
              ) : (
                <div style={{ marginRight: 28 }} />
              )}
            </div>
          )}
          <IconBase
            fill="#0076D9"
            icon={item.org ? OrgIcon : DepartmentIcon}
            style={{ marginRight: 8 }}
          />
          {item.isNew && (
            <Input
              autoFocus
              onClick={e => e.stopPropagation()}
              onPressEnter={e => {
                item.name = e.target.value;
                item.isNew = false;
                setRenderTreeData([].concat(renderTreeData));
                submitNew(e, root);
              }}
              onChange={e => {
                item.name = e.target.value;
                item.isNew = true;
              }}
              onBlur={e => submitNew(e, root)}
              defaultValue={item.name || '未命名部门'}
            />
          )}
          {item.rename && (
            <Input
              autoFocus
              ref={renameRef}
              onClick={e => e.stopPropagation()}
              onFocus={e => e.target.select()}
              onPressEnter={e => submitRename(e, item.id, root)}
              onBlur={e => submitRename(e, item.id, root)}
              onChange={e => {
                item.name = e.target.value;
              }}
              defaultValue={item.name}
            />
          )}
          {!item.isNew && !item.rename && (
            <div style={{ width: 170, height: 22 }}>
              <Popover content={item.name}>
                <Paragraph ellipsis={{ rows: 1, expandable: false }}>{item.name}</Paragraph>
              </Popover>
            </div>
          )}
          {item.org && isAdmin && (
            <PlusIcon showHover onClick={e => handleSubNew(e, item)} style={{ marginLeft: 28 }} />
          )}
          {!item.isNew && item.hover && (
            <div onClick={e => e.stopPropagation()}>
              {!item.org && (
                <Dropdown
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
                        onClick={() =>
                          Modal.info({
                            title: `确认删除${item.name}吗？`,
                            content: '删除后，部门内所有成员将不再拥有该部门已配置的所有权限。',
                            okText: ' 取消 ',
                            cancelText: '确定',
                            onCancel: () => submitDelete(item.id, root),
                          })
                        }
                      >
                        删除
                      </Menu.Item>
                    </Menu>
                  }
                  placement="bottomRight"
                >
                  <IconBase icon={MoreIcon} />
                </Dropdown>
              )}
            </div>
          )}
        </div>
        {item.child?.length && (item.org || item.expand) ? (
          <TreeChildren root={item} treeList={item.child} deep={deep + 1} />
        ) : null}
      </>
    ));

  return (
    <div className={styles.treeWrap}>
      {<TreeChildren root={null} treeList={renderTreeData} deep={-1} />}
    </div>
  );
}

export default connect()(Tree);
